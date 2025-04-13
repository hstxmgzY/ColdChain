#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
基于 RL4CO 风格的 Pickup-and-Delivery (PDP) 环境示例代码

该示例模拟冷链场景下的取送货问题：
  - 每个订单包含一个取货点和一个送货点（前端数据可通过 JSON 提供，经后端预处理转换为模型需要的张量）。
  - 车辆从配送中心出发，必须先到取货点取货，再送货点送货，且受车辆容量约束。
  
示例包括：
  1. PDPGenerator：生成包含 depot、订单（pickup 和 delivery）、订单负载等数据；
  2. PDPEnv：自定义环境，支持状态重置、步进、动作 mask 更新和奖励计算；
  3. 贪心策略（greedy_policy）和 rollout，用于示范基于当前状态选择下一步动作；
  4. 命令行接口，模拟多实例（batch）的 PDP 问题求解。

使用示例：
    python pdp_rl4co.py --batch_size 2 --num_orders 3
"""

import torch
import numpy as np
import argparse

# 定义节点类型常量
NODE_DEPOT = 0
NODE_PICKUP = 1
NODE_DELIVERY = 2

class PDPGenerator:
    """
    数据生成器，用于生成 Pickup-and-Delivery 问题实例
    每个订单包含一个取货点和一个送货点
    """
    def __init__(self, num_orders=3, coord_range=((116.0, 117.0), (39.0, 40.0))):
        self.num_orders = num_orders
        self.coord_range = coord_range  # ((lon_min, lon_max), (lat_min, lat_max))

    def generate(self, batch_size=1):
        num_nodes = 1 + 2 * self.num_orders  # 1 个 depot + 每个订单 2 个节点
        batch_locs = []
        batch_node_type = []
        batch_order_map = []
        batch_order_load = []
        for _ in range(batch_size):
            # 随机生成 depot 坐标
            lon_min, lon_max = self.coord_range[0]
            lat_min, lat_max = self.coord_range[1]
            depot = [np.random.uniform(lon_min, lon_max), np.random.uniform(lat_min, lat_max)]
            locs = [depot]
            node_type = [NODE_DEPOT]
            order_map = [-1]  # depot 对应的 order_map 设为 -1
            order_load = []
            # 对于每个订单，随机生成 pickup 和 delivery 坐标及订单负载
            for order_id in range(self.num_orders):
                pickup = [np.random.uniform(lon_min, lon_max), np.random.uniform(lat_min, lat_max)]
                delivery = [np.random.uniform(lon_min, lon_max), np.random.uniform(lat_min, lat_max)]
                locs.append(pickup)
                locs.append(delivery)
                node_type.extend([NODE_PICKUP, NODE_DELIVERY])
                order_map.extend([order_id, order_id])
                # 订单负载，随机整数 1~10
                load = np.random.randint(1, 11)
                order_load.append(load)
            # 转换为 numpy 数组
            locs = np.array(locs, dtype=np.float32)  # (num_nodes, 2)
            node_type = np.array(node_type, dtype=np.int32)  # (num_nodes,)
            order_map = np.array(order_map, dtype=np.int32)    # (num_nodes,)
            order_load = np.array(order_load, dtype=np.int32)    # (num_orders,)
            batch_locs.append(locs)
            batch_node_type.append(node_type)
            batch_order_map.append(order_map)
            batch_order_load.append(order_load)
        # 转换成 tensor，形状 (batch_size, ·)
        batch_data = {
            "locs": torch.tensor(np.stack(batch_locs, axis=0)),         # (batch_size, num_nodes, 2)
            "node_type": torch.tensor(np.stack(batch_node_type, axis=0)),  # (batch_size, num_nodes)
            "order_map": torch.tensor(np.stack(batch_order_map, axis=0)),  # (batch_size, num_nodes)
            "order_load": torch.tensor(np.stack(batch_order_load, axis=0)),# (batch_size, num_orders)
            "num_orders": self.num_orders
        }
        return batch_data

class PDPEnv:
    """
    自定义 Pickup-and-Delivery 环境
    模拟车辆需先到取货点、后到送货点，并受车辆容量约束；
    环境状态包含车辆当前位置、已访问状态、订单状态、车辆载荷及累计行驶距离等。
    """
    def __init__(self, generator, vehicle_capacity=20):
        self.generator = generator
        self.vehicle_capacity = vehicle_capacity

    def reset(self, data):
        """
        根据生成器输出的数据重置环境状态
        返回状态 state：
          - locs: (batch_size, num_nodes, 2)
          - node_type: (batch_size, num_nodes)
          - order_map: (batch_size, num_nodes)
          - order_load: (batch_size, num_orders)
          - current_node: (batch_size,) 当前车辆所在节点（初始 depot）
          - visited: (batch_size, num_nodes) 布尔型，标记已访问节点
          - pickup_done: (batch_size, num_orders) 布尔型，标记各订单取货是否完成
          - delivery_done: (batch_size, num_orders) 布尔型，标记各订单送货是否完成
          - current_load: (batch_size,) 当前车辆载货量
          - total_distance: (batch_size,) 累计行驶距离
          - done: (batch_size,) 是否完成所有订单
          - action_mask: (batch_size, num_nodes) 当前合法动作 mask
        """
        state = {}
        state["locs"] = data["locs"]
        state["node_type"] = data["node_type"]
        state["order_map"] = data["order_map"]
        state["order_load"] = data["order_load"]
        batch_size, num_nodes, _ = state["locs"].shape
        num_orders = data["num_orders"]

        state["current_node"] = torch.zeros(batch_size, dtype=torch.int64)  # 初始在 depot
        state["visited"] = torch.zeros(batch_size, num_nodes, dtype=torch.bool)
        state["visited"][:, 0] = True  # depot 视为已访问

        state["pickup_done"] = torch.zeros(batch_size, num_orders, dtype=torch.bool)
        state["delivery_done"] = torch.zeros(batch_size, num_orders, dtype=torch.bool)
        state["current_load"] = torch.zeros(batch_size, dtype=torch.int32)
        state["total_distance"] = torch.zeros(batch_size, dtype=torch.float32)
        state["done"] = torch.zeros(batch_size, dtype=torch.bool)

        state["action_mask"] = self.update_action_mask(state)
        return state

    def update_action_mask(self, state):
        """
        根据当前状态更新动作 mask：
         - 已访问的节点不允许再次选择；
         - depot 不允许重复访问；
         - 取货节点：只有当尚未访问且添加订单负载后不超出车辆容量时允许；
         - 送货节点：仅当对应订单已取货且尚未送货时允许选择。
        返回 Boolean tensor (batch_size, num_nodes)
        """
        batch_size, num_nodes, _ = state["locs"].shape
        mask = torch.zeros(batch_size, num_nodes, dtype=torch.bool)
        for b in range(batch_size):
            for n in range(num_nodes):
                if state["visited"][b, n]:
                    mask[b, n] = False
                    continue
                if state["node_type"][b, n] == NODE_DEPOT:
                    mask[b, n] = False
                    continue
                if state["node_type"][b, n] == NODE_PICKUP:
                    order_id = state["order_map"][b, n].item()
                    order_load = state["order_load"][b, order_id].item()
                    if state["current_load"][b] + order_load <= self.vehicle_capacity:
                        mask[b, n] = True
                    else:
                        mask[b, n] = False
                    continue
                if state["node_type"][b, n] == NODE_DELIVERY:
                    order_id = state["order_map"][b, n].item()
                    if state["pickup_done"][b, order_id] and (not state["delivery_done"][b, order_id]):
                        mask[b, n] = True
                    else:
                        mask[b, n] = False
                    continue
        return mask

    def step(self, state, actions):
        """
        根据选定动作进行一步状态转移
        参数：
          state: 当前状态字典
          actions: tensor (batch_size,) 表示各实例选取的下一个节点索引
        返回更新后的状态 new_state：
          - 更新当前节点、累计距离、订单状态、车辆载荷及 visited 标记；
          - 并更新动作 mask 以及完成标志。
        """
        batch_size, num_nodes, _ = state["locs"].shape
        # 由于状态为字典，且内含 tensor，需要先复制各关键量
        new_state = state.copy()
        new_state["visited"] = state["visited"].clone()
        new_state["pickup_done"] = state["pickup_done"].clone()
        new_state["delivery_done"] = state["delivery_done"].clone()
        new_state["current_load"] = state["current_load"].clone()
        new_state["total_distance"] = state["total_distance"].clone()
        new_state["done"] = state["done"].clone()

        for b in range(batch_size):
            if state["done"][b]:
                continue
            current = state["current_node"][b].item()
            next_node = actions[b].item()
            pos_current = state["locs"][b, current]
            pos_next = state["locs"][b, next_node]
            dist = torch.norm(pos_next - pos_current, p=2)
            new_state["total_distance"][b] += dist
            new_state["current_node"][b] = actions[b]
            new_state["visited"][b, next_node] = True

            # 根据节点类型更新订单状态和车辆载荷
            node_type = state["node_type"][b, next_node].item()
            if node_type == NODE_PICKUP:
                order_id = state["order_map"][b, next_node].item()
                new_state["pickup_done"][b, order_id] = True
                load = state["order_load"][b, order_id].item()
                new_state["current_load"][b] += load
            elif node_type == NODE_DELIVERY:
                order_id = state["order_map"][b, next_node].item()
                if state["pickup_done"][b, order_id]:
                    new_state["delivery_done"][b, order_id] = True
                    load = state["order_load"][b, order_id].item()
                    new_state["current_load"][b] -= load
            # 判断是否所有订单均完成（取货与送货都完成）
            if torch.all(new_state["pickup_done"][b]) and torch.all(new_state["delivery_done"][b]):
                new_state["done"][b] = True

        new_state["action_mask"] = self.update_action_mask(new_state)
        return new_state

    def get_reward(self, state):
        """
        以负累计行驶距离作为奖励（成本最小化问题）
        """
        return -state["total_distance"]

    def render(self, state):
        """
        简单打印当前状态信息，便于调试与观察
        """
        batch_size, num_nodes, _ = state["locs"].shape
        for b in range(batch_size):
            print(f"实例 {b}:")
            print(f"  当前节点: {state['current_node'][b].item()}")
            print(f"  当前载荷: {state['current_load'][b].item()}")
            print(f"  累计距离: {state['total_distance'][b].item():.2f}")
            print(f"  pickup_done: {state['pickup_done'][b].tolist()}")
            print(f"  delivery_done: {state['delivery_done'][b].tolist()}")
            print(f"  done: {state['done'][b].item()}")
            print("------------")

def greedy_policy(state, env):
    """
    简单的贪心策略：从当前节点出发，计算到所有合法节点的欧氏距离，选择距离最近的节点。
    参数：
       state: 当前状态
       env: 环境对象（用于获取 locs 与 action_mask）
    返回：tensor (batch_size,) 表示选中的节点索引
    """
    batch_size, num_nodes, _ = state["locs"].shape
    actions = torch.zeros(batch_size, dtype=torch.int64)
    for b in range(batch_size):
        if state["done"][b]:
            actions[b] = state["current_node"][b]
            continue
        current = state["current_node"][b].item()
        pos_current = state["locs"][b, current].unsqueeze(0)  # (1,2)
        all_positions = state["locs"][b]  # (num_nodes,2)
        dists = torch.norm(all_positions - pos_current, dim=1, p=2)
        mask = state["action_mask"][b]
        dists[~mask] = float("inf")
        if torch.all(torch.isinf(dists)):
            actions[b] = current
        else:
            actions[b] = torch.argmin(dists)
    return actions

def rollout(env, state, policy=greedy_policy, max_steps=50):
    """
    根据策略进行 rollout，直至所有实例完成或达到最大步数
    返回最终状态及各实例的动作轨迹（记录每一步选定的节点）
    """
    batch_size = state["locs"].shape[0]
    trajectories = [[] for _ in range(batch_size)]
    steps = 0
    while not torch.all(state["done"]) and steps < max_steps:
        actions = policy(state, env)
        for b in range(batch_size):
            trajectories[b].append(actions[b].item())
        state = env.step(state, actions)
        steps += 1
    return state, trajectories

def main():
    parser = argparse.ArgumentParser(description="PDP 路径规划环境")
    parser.add_argument("--batch_size", type=int, default=2, help="批处理大小")
    parser.add_argument("--num_orders", type=int, default=3, help="每个实例订单数量")
    args = parser.parse_args()

    # 生成 PDP 数据
    generator = PDPGenerator(num_orders=args.num_orders)
    data = generator.generate(batch_size=args.batch_size)
    # 初始化环境（例如车辆容量设为 20）
    env = PDPEnv(generator, vehicle_capacity=20)
    state = env.reset(data)
    print("初始状态:")
    env.render(state)
    # 使用贪心策略 rollout
    final_state, trajectories = rollout(env, state, policy=greedy_policy, max_steps=50)
    print("\n最终状态:")
    env.render(final_state)
    for b in range(args.batch_size):
        print(f"实例 {b} 的轨迹: {trajectories[b]}")
    reward = env.get_reward(final_state)
    print("\n奖励 (负累计距离):", reward.tolist())

if __name__ == "__main__":
    main()
