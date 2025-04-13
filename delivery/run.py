import argparse
import torch
import numpy as np
from pdp_generator import PDPGenerator
from pdp_env import PDPEnv, rollout, greedy_policy
from map_api import compute_distance_matrix, generate_static_map_url


def main():
    parser = argparse.ArgumentParser(description="PDP 路径规划带地图 API 集成")
    parser.add_argument("--batch_size", type=int, default=1, help="批处理大小")
    parser.add_argument("--num_orders", type=int, default=3, help="每个实例订单数量")
    args = parser.parse_args()

    # 生成 PDP 数据
    generator = PDPGenerator(num_orders=args.num_orders)
    data = generator.generate(batch_size=args.batch_size)

    locs_np = data["locs"].squeeze(0).numpy()

    print("预计算距离矩阵，请稍候...")
    distance_matrix = compute_distance_matrix(locs_np)  # 🔄 不再传 api_key
    print("距离矩阵预计算完成。")

    # 初始化环境
    env = PDPEnv(vehicle_capacity=20)
    state = env.reset(data)
    print("初始状态:")
    env.render(state)

    final_state, trajectories = rollout(env, state, distance_matrix, policy=greedy_policy, max_steps=50)
    print("\n最终状态:")
    env.render(final_state)
    for b in range(args.batch_size):
        print(f"实例 {b} 的轨迹: {trajectories[b]}")
    reward = env.get_reward(final_state)
    print("\n奖励 (负累计距离):", reward.tolist())
    print("\n配送路径地图链接：")
    for b in range(args.batch_size):
        locs = data["locs"][b].numpy()
        traj = trajectories[b]
        map_url = generate_static_map_url(locs, traj)
        print(f"实例 {b} 路径图：{map_url}")

if __name__ == "__main__":
    main()


