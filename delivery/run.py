import argparse, json
import numpy as np, torch
from map_api import address_to_location, compute_distance_matrix
from pdp_env import PDPEnv, rollout, greedy_policy
from pdp_generator import NODE_DEPOT, NODE_PICKUP, NODE_DELIVERY

def prepare_data(coords):
    num_orders = (len(coords)-1)//2
    node_type = [NODE_DEPOT] + [NODE_PICKUP, NODE_DELIVERY]*num_orders
    order_map = [-1] + [i for i in range(num_orders) for _ in range(2)]
    order_load = torch.randint(1,11,(num_orders,),dtype=torch.int32)
    return {
        "locs":       torch.tensor([coords],dtype=torch.float32),
        "node_type":  torch.tensor([node_type],dtype=torch.int64),
        "order_map":  torch.tensor([order_map],dtype=torch.int64),
        "order_load": order_load.unsqueeze(0),
        "num_orders": num_orders
    }

def segment_trajectories(full_traj, node_types):
    """
    按送货节点在 full_traj 中出现的顺序，切分成若干段：
    - 第一段：以 depot(0) 开头，到第一个配送节点结束。
    - 后续段：以上一配送节点开头，到本次配送节点结束。
    """
    segments = []
    prev_idx = -1  # 上一次配送节点在 full_traj 中的下标
    for idx, node in enumerate(full_traj):
        # node_types[node] == 2 表示这是一个送货节点
        if node_types[node] == 2:
            if prev_idx < 0:
                # 第一段
                seg = [0] + full_traj[:idx+1]
            else:
                # 后续段
                seg = [full_traj[prev_idx]] + full_traj[prev_idx+1:idx+1]
            segments.append(seg)
            prev_idx = idx
    return segments


def main():
    p = argparse.ArgumentParser("地址版PDP路径规划")
    p.add_argument("--depot",  required=True, help="仓库地址")
    p.add_argument("--orders", nargs="+", required=True,
                   help="每笔订单 pickup;delivery，用分号分隔")
    args = p.parse_args()

    # 1. 地理编码：地址→坐标
    coords = []
    depot_loc = address_to_location(args.depot)
    if not depot_loc:
        raise SystemExit(f"仓库解析失败: {args.depot}")
    coords.append(depot_loc)
    for od in args.orders:
        try:
            pu_addr, de_addr = od.split(";",1)
        except:
            raise SystemExit(f"订单格式错误: {od}")
        pu_loc = address_to_location(pu_addr)
        de_loc = address_to_location(de_addr)
        if not pu_loc or not de_loc:
            raise SystemExit(f"地址解析失败: {od}")
        coords.extend([pu_loc, de_loc])

    # 2. 计算距离矩阵 & 准备环境数据
    dist_mat = compute_distance_matrix(coords)
    data     = prepare_data(coords)

    # 3. 路径规划
    env       = PDPEnv(vehicle_capacity=20)
    state     = env.reset(data)
    _, trajs  = rollout(env, state, dist_mat, policy=greedy_policy, max_steps=100)
    full_traj = trajs[0]  # 完整访问序列，不含 depot

    # 4. 拆分每笔订单的轨迹
    # 4. 分段：按实际送货节点顺序
    node_types = data["node_type"][0].tolist()  # [0,1,2,1,2,...]
    segments = segment_trajectories(full_traj, node_types)

    # 5. 构造 locs 输出
    locs_out = []
    for i,(lon,lat) in enumerate(coords):
        locs_out.append({
            "position": [lon, lat],
            "nodeType":   data["node_type"][0,i].item(),
            "orderId":    data["order_map"][0,i].item()
        })

    result = {"locs": locs_out, "trajectories": segments}
    print(json.dumps(result, ensure_ascii=False, indent=2))

if __name__=="__main__":
    main()
