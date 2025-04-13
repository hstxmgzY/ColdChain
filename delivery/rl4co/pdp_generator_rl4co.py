import numpy as np
import torch

# 节点类型常量
NODE_DEPOT = 0
NODE_PICKUP = 1
NODE_DELIVERY = 2

class PDPGenerator:
    """
    PDP 数据生成器，生成 Pickup-and-Delivery 问题实例。
    每个实例包含：
      - 1 个 depot（节点 0）
      - 每个订单生成一对节点，依次为 pickup 与 delivery
      - order_map：记录每个非 depot 节点对应的订单编号
      - order_load：每个订单的负载信息（取货时增加，送货时减少）
    """
    def __init__(self, num_orders=5, coord_range=((0, 1), (0, 1))):
        self.num_orders = num_orders
        self.num_loc = 2 * num_orders + 1  # depot + 2 * orders
        self.coord_range = coord_range

    def __call__(self, batch_size):
        batch_locs = []
        batch_node_type = []
        batch_order_map = []
        batch_order_load = []
        for _ in range(batch_size):
            lon_min, lon_max = self.coord_range[0]
            lat_min, lat_max = self.coord_range[1]
            depot = [np.random.uniform(lon_min, lon_max), np.random.uniform(lat_min, lat_max)]
            locs = [depot]
            node_type = [NODE_DEPOT]
            order_map = [-1]
            order_load = []
            for order_id in range(self.num_orders):
                pickup = [np.random.uniform(lon_min, lon_max), np.random.uniform(lat_min, lat_max)]
                delivery = [np.random.uniform(lon_min, lon_max), np.random.uniform(lat_min, lat_max)]
                locs.extend([pickup, delivery])
                node_type.extend([NODE_PICKUP, NODE_DELIVERY])
                order_map.extend([order_id, order_id])
                load = np.random.randint(1, 6)
                order_load.append(load)
            locs = np.array(locs, dtype=np.float32)
            node_type = np.array(node_type, dtype=np.int32)
            order_map = np.array(order_map, dtype=np.int32)
            order_load = np.array(order_load, dtype=np.int32)
            batch_locs.append(locs)
            batch_node_type.append(node_type)
            batch_order_map.append(order_map)
            batch_order_load.append(order_load)
        data = {
            "locs": torch.as_tensor(np.stack(batch_locs), dtype=torch.float32),
            "node_type": torch.as_tensor(np.stack(batch_node_type)),
            "order_map": torch.as_tensor(np.stack(batch_order_map)),
            "order_load": torch.as_tensor(np.stack(batch_order_load)),
            "num_orders": torch.tensor(self.num_orders)
        }
        for k in ["node_type", "order_map"]:
            if data[k].ndim == 1:
                data[k] = data[k].unsqueeze(0)
        return data
