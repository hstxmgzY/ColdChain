import numpy as np
import torch

# 节点类型常量定义
NODE_DEPOT = 0  # 仓库节点
NODE_PICKUP = 1 # 取货节点
NODE_DELIVERY = 2 # 送货节点

class PDPGenerator:
    """
    数据生成器，用于生成 Pickup-and-Delivery 问题实例。
    每个实例包含一个 depot 以及若干订单（每个订单包含 pickup 与 delivery 节点）。
    """
    def __init__(self, num_orders=3, coord_range=((116.0, 117.0), (39.0, 40.0))):
        """
        初始化数据生成器。
        :param num_orders: 每个实例的订单数量
        :param coord_range: 坐标范围，格式为 ((lon_min, lon_max), (lat_min, lat_max))
        """
        self.num_orders = num_orders
        self.coord_range = coord_range  # ((lon_min, lon_max), (lat_min, lat_max))

    def generate(self, batch_size=1):
        num_nodes = 1 + 2 * self.num_orders  # depot + 每个订单 2 个节点
        batch_locs = [] # 存储每个实例的坐标
        batch_node_type = [] # 存储每个实例的节点类型
        batch_order_map = [] # 存储每个实例的订单映射
        batch_order_load = [] # 存储每个实例的订单负载
        for _ in range(batch_size):
            lon_min, lon_max = self.coord_range[0]
            lat_min, lat_max = self.coord_range[1]
            # 随机生成 depot 坐标
            depot = [np.random.uniform(lon_min, lon_max), np.random.uniform(lat_min, lat_max)]
            locs = [depot] # 存储 depot 坐标
            node_type = [NODE_DEPOT] # 存储 depot 节点类型
            order_map = [-1]  # depot 不属于任何订单
            order_load = [] 
            # 对于每个订单，随机生成 pickup 与 delivery 坐标及负载（1~10）
            for order_id in range(self.num_orders):
                pickup = [np.random.uniform(lon_min, lon_max), np.random.uniform(lat_min, lat_max)]
                delivery = [np.random.uniform(lon_min, lon_max), np.random.uniform(lat_min, lat_max)]
                locs.append(pickup)
                locs.append(delivery)
                node_type.extend([NODE_PICKUP, NODE_DELIVERY])
                order_map.extend([order_id, order_id])
                load = np.random.randint(1, 11)
                order_load.append(load)
            locs = np.array(locs, dtype=np.float32)      # (num_nodes, 2)
            node_type = np.array(node_type, dtype=np.int32)  # (num_nodes,)
            order_map = np.array(order_map, dtype=np.int32)    # (num_nodes,)
            order_load = np.array(order_load, dtype=np.int32)  # (num_orders,)
            batch_locs.append(locs)
            batch_node_type.append(node_type)
            batch_order_map.append(order_map)
            batch_order_load.append(order_load)
        batch_data = {
            "locs": torch.tensor(np.stack(batch_locs, axis=0)),         # (batch_size, num_nodes, 2)
            "node_type": torch.tensor(np.stack(batch_node_type, axis=0)),  # (batch_size, num_nodes)
            "order_map": torch.tensor(np.stack(batch_order_map, axis=0)),  # (batch_size, num_nodes)
            "order_load": torch.tensor(np.stack(batch_order_load, axis=0)),# (batch_size, num_orders)
            "num_orders": self.num_orders
        }
        return batch_data
