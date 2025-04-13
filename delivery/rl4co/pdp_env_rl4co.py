import torch
from torch.utils.data import Dataset
from torchrl.data.tensordict.tensordict import TensorDict
# from torchrl.data.tensordict import TensorDict

from pdp_generator_rl4co import NODE_DEPOT, NODE_PICKUP, NODE_DELIVERY

def pdp_collate_fn(batch):
    """
    将一系列字典样本批量化。如果某个键的值不是 Tensor，则直接保留第一个样本的该值。
    """
    collated = {}
    for key in batch[0]:
        if torch.is_tensor(batch[0][key]):
            collated[key] = torch.stack([sample[key] for sample in batch], dim=0)
        else:
            collated[key] = batch[0][key]
    return collated

class PDPDataset(Dataset):
    def __init__(self, generator, data_size):
        """
        generator：PDPGenerator 对象，用于生成数据  
        data_size：数据集大小，即样本数
        """
        self.generator = generator
        self.data_size = data_size

    def __len__(self):
        return self.data_size

    def __getitem__(self, index):
        sample = self.generator(1)
        # 去除单样本中多余的 batch 维度
        keys_to_squeeze = ["locs", "node_type", "order_map", "order_load"]
        for key in keys_to_squeeze:
            if key in sample and torch.is_tensor(sample[key]) and sample[key].shape[0] == 1:
                sample[key] = sample[key].squeeze(0)
        sample["shape"] = sample["locs"].shape  # 例如 (num_loc, 2)
        return sample

    @property
    def collate_fn(self):
        return pdp_collate_fn

class PDPEnv:
    """
    PDP 环境，基于 RL4CO 风格。车辆在送货前必须完成相应订单的取货，
    并受车辆容量约束。状态包含：
      - locs, node_type, order_map, order_load（由生成器提供）
      - current_node：当前车辆位置（索引）
      - visited：已访问的节点（bool mask）
      - pickup_done, delivery_done：各订单取货/送货状态
      - current_load：当前车辆载荷
      - total_distance：累计行驶距离
      - done：是否完成所有订单
      - action_mask：当前合法动作 mask
    """
    def __init__(self, vehicle_capacity=10, generator=None):
        self.vehicle_capacity = vehicle_capacity
        self.name = "pdp"  # 环境名称需符合 RL4CO 要求
        if generator is None:
            raise ValueError("请传入 PDP 数据生成器")
        self.generator = generator

    def dataset(self, data_size, phase="train"):
        from pdp_env_rl4co import PDPDataset
        return PDPDataset(self.generator, data_size)
    
    def reset(self, data):
        # 若 "locs" 多余一层，则 squeeze
        if data["locs"].ndim == 4 and data["locs"].shape[1] == 1:
            data["locs"] = data["locs"].squeeze(1)
        batch_size, num_loc, _ = data["locs"].shape
        state = {
            "locs": data["locs"],
            "node_type": data["node_type"],
            "order_map": data["order_map"],
            "order_load": data["order_load"],
            "current_node": torch.zeros(batch_size, dtype=torch.int64),
            "visited": torch.zeros(batch_size, num_loc, dtype=torch.bool),
            "pickup_done": torch.zeros(batch_size, self.generator.num_orders, dtype=torch.bool),
            "delivery_done": torch.zeros(batch_size, self.generator.num_orders, dtype=torch.bool),
            "current_load": torch.zeros(batch_size, dtype=torch.int32),
            "total_distance": torch.zeros(batch_size, dtype=torch.float32),
            "done": torch.zeros(batch_size, dtype=torch.bool),
        }
        state["visited"][:, 0] = True  # depot 已访问
        state["action_mask"] = self.update_action_mask(state)
        # 使用 torchrl 的 TensorDict 封装状态
        state = TensorDict(state, batch_size=(batch_size,))
        return state

    def update_action_mask(self, state):
        batch_size, num_loc, _ = state["locs"].shape
        mask = torch.zeros(batch_size, num_loc, dtype=torch.bool)
        for b in range(batch_size):
            for n in range(num_loc):
                if state["visited"][b, n]:
                    continue
                if state["node_type"][b, n] == NODE_DEPOT:
                    continue
                if state["node_type"][b, n] == NODE_PICKUP:
                    order_id = state["order_map"][b, n].item()
                    load = state["order_load"][b, order_id].item()
                    if state["current_load"][b] + load <= self.vehicle_capacity:
                        mask[b, n] = True
                elif state["node_type"][b, n] == NODE_DELIVERY:
                    order_id = state["order_map"][b, n].item()
                    if state["pickup_done"][b, order_id] and (not state["delivery_done"][b, order_id]):
                        mask[b, n] = True
        return mask

    def step(self, state, actions=None):
        if actions is None:
            if "action" in state:
                actions = state["action"]
            else:
                raise ValueError("step: 未提供 actions 参数，也无法从 state 获取 'action' 字段。")
        # 若动作 tensor 为二维，则 flatten
        if actions.dim() == 2:
            actions = actions.view(-1)
        batch_size, num_loc, _ = state["locs"].shape
        new_state = {k: v.clone() for k, v in state.items() if torch.is_tensor(v)}
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
        new_state["shape"] = (batch_size,)
        new_state = TensorDict(new_state, batch_size=(batch_size,))
        return {"next": new_state}

    def get_reward(self, state, actions=None):
        return -state["total_distance"]

    def render(self, state):
        batch_size, num_loc, _ = state["locs"].shape
        for b in range(batch_size):
            print(f"Instance {b}:")
            print(f"  Current node: {state['current_node'][b].item()}")
            print(f"  Current load: {state['current_load'][b].item()}")
            print(f"  Total distance: {state['total_distance'][b].item():.2f}")
            print(f"  Pickup done: {state['pickup_done'][b].tolist()}")
            print(f"  Delivery done: {state['delivery_done'][b].tolist()}")
            print(f"  Done: {state['done'][b].item()}")
            print("------------")

    def get_num_starts(self, td):
        # 为训练设置多起点
        return 2
    
    def select_start_nodes(self, td, num_starts):
        batch_size = td['locs'].shape[0]
        device = td['locs'].device
        return torch.zeros(batch_size, num_starts, dtype=torch.int64, device=device)
