import torch
from pdp_generator import NODE_DEPOT, NODE_PICKUP, NODE_DELIVERY

class PDPEnv:
    """
    PDP 环境：车辆必须先到取货点取货后才能送货，受车辆容量约束，环境中更新累计行驶距离时采用预计算的地图真实距离。
    """
    def __init__(self, vehicle_capacity=20):
        self.vehicle_capacity = vehicle_capacity

    def reset(self, data):
        """
        根据生成的数据重置环境，初始化各类状态
        返回 state 字典，包含：
          - locs、node_type、order_map、order_load
          - current_node (车辆当前位置)、visited (已访问节点)
          - pickup_done、delivery_done（订单状态）
          - current_load（车辆载荷）、total_distance（累计行驶距离）
          - done（是否完成所有订单）
          - action_mask（合法动作 mask）
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
          - 已访问节点和 depot 均不可选
          - 对于取货节点：当车辆加上该订单负载不超出 capacity 时允许
          - 对于送货节点：仅当对应订单已取货且未送货时允许
        返回：Boolean tensor (batch_size, num_nodes)
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
                    load = state["order_load"][b, order_id].item()
                    if state["current_load"][b] + load <= self.vehicle_capacity:
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

    def step(self, state, actions, distance_matrix):
        """
        根据动作 actions 更新状态，使用预先计算的 distance_matrix 更新累计距离
        参数:
          state: 当前状态字典
          actions: tensor (batch_size,) 各实例选取的节点索引
          distance_matrix: 预计算的距离矩阵 (num_nodes, num_nodes)
        返回更新后的 state
        """
        batch_size, num_nodes, _ = state["locs"].shape
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
            # 使用地图真实距离
            dist = distance_matrix[current][next_node]
            new_state["total_distance"][b] += dist
            new_state["current_node"][b] = actions[b]
            new_state["visited"][b, next_node] = True

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
            if torch.all(new_state["pickup_done"][b]) and torch.all(new_state["delivery_done"][b]):
                new_state["done"][b] = True

        new_state["action_mask"] = self.update_action_mask(new_state)
        return new_state

    def get_reward(self, state):
        """
        以负累计距离作为奖励（目标为最小化运输距离）
        """
        return -state["total_distance"]

    def render(self, state):
        """
        打印当前状态信息，便于观察
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

def greedy_policy(state, env, distance_matrix):
    """
    贪心策略：根据距离矩阵选择当前合法动作中距离最近的节点
    参数:
      state: 当前状态
      env: PDPEnv（用于获取状态信息）
      distance_matrix: 预计算的距离矩阵
    返回:
      tensor (batch_size,) 各实例选取的节点索引
    """
    batch_size, num_nodes, _ = state["locs"].shape
    actions = torch.zeros(batch_size, dtype=torch.int64)
    for b in range(batch_size):
        if state["done"][b]:
            actions[b] = state["current_node"][b]
            continue
        current = state["current_node"][b].item()
        # 从当前节点在 distance_matrix 中取出距离向量
        dists = torch.tensor(distance_matrix[current])
        mask = state["action_mask"][b]
        dists[~mask] = float("inf")
        if torch.all(torch.isinf(dists)):
            actions[b] = current
        else:
            actions[b] = torch.argmin(dists)
    return actions

def rollout(env, state, distance_matrix, policy=greedy_policy, max_steps=50):
    """
    根据 policy 进行 rollout，直至所有实例完成或达到最大步数。
    打印每一步的路径信息、配送状态。
    返回最终状态和轨迹记录（每实例每步选择的节点索引列表）。
    """
    batch_size = state["locs"].shape[0]
    trajectories = [[] for _ in range(batch_size)]
    steps = 0

    while not torch.all(state["done"]) and steps < max_steps:
        actions = policy(state, env, distance_matrix)
        for b in range(batch_size):
            if state["done"][b]:
                continue
            current = state["current_node"][b].item()
            next_node = actions[b].item()
            dist = distance_matrix[current][next_node]
            print(f"\n🧭 实例 {b} - 步骤 {steps + 1}")
            print(f"  从节点 {current} -> {next_node}，本次距离: {dist:.2f} km")
            print(f"  当前累计距离: {state['total_distance'][b].item():.2f} km")
            print(f"  当前载荷: {state['current_load'][b].item()}")
            print(f"  已取货订单: {state['pickup_done'][b].tolist()}")
            print(f"  已送达订单: {state['delivery_done'][b].tolist()}")

        for b in range(batch_size):
            trajectories[b].append(actions[b].item())

        state = env.step(state, actions, distance_matrix)
        steps += 1

    return state, trajectories

