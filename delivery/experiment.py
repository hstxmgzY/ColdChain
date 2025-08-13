import time
import random
import numpy as np
import torch
import matplotlib.pyplot as plt
from pdp_env import PDPEnv, rollout, greedy_policy, aco_policy, greedy_then_aco_policy, greedy_then_mmas_policy
from pdp_generator import PDPGenerator
from map_api import compute_distance_matrix2
import csv
import os

# 固定随机种子，保证复现性
random.seed(42)
np.random.seed(42)
torch.manual_seed(42)

# 统一实验参数
vehicle_capacity = 999999
coord_range = ((121.2, 121.8), (29.7, 30.0))
order_sizes = [5, 10, 20, 30, 40, 50]  # 要增加30,40,50
methods = {
    "greedy": greedy_policy,
    "aco": aco_policy,
    "greedy_then_aco": greedy_then_aco_policy,
    "greedy_then_mmas": greedy_then_mmas_policy
}

# 1. 不同订单规模 n=5,10,20,30,40,50，固定蚂蚁数量=20
# results_order_size = []

# for n_orders in order_sizes:
#     print(f"\n===== 订单数量: {n_orders} =====")

#     generator = PDPGenerator(num_orders=n_orders, coord_range=coord_range)
#     data = generator.generate(batch_size=1)
#     coords = data["locs"][0].numpy().tolist()
#     distance_matrix = compute_distance_matrix2(coords)

#     greedy_distance = None

#     for method_name, policy_fn in methods.items():
#         print(f"\n>>> 方法: {method_name}")

#         env = PDPEnv(vehicle_capacity=vehicle_capacity)
#         state = env.reset(data)

#         # 设置不同方法特定参数
#         kwargs = {}
#         if method_name in ["aco", "greedy_then_aco", "greedy_then_mmas"]:
#             kwargs = {"num_ants": 20, "num_iters": 30}

#         start_time = time.time()
#         final_state, trajs = rollout(env, state, distance_matrix, policy=lambda s, e, d: policy_fn(s, e, d, **kwargs), max_steps=500)
#         end_time = time.time()

#         total_distance = final_state["total_distance"][0].item()
#         elapsed_time = end_time - start_time

#         if method_name == "greedy":
#             greedy_distance = total_distance

#         optimize_rate = None
#         if method_name != "greedy" and greedy_distance:
#             optimize_rate = (greedy_distance - total_distance) / greedy_distance * 100

#         results_order_size.append({
#             "n_orders": n_orders,
#             "method": method_name,
#             "total_distance": total_distance,
#             "elapsed_time": elapsed_time,
#             "optimize_rate": optimize_rate
#         })

# 保存n变化实验结果
# os.makedirs("results", exist_ok=True)
# with open("results/experiment_results_order_size.csv", "w", newline="") as f:
#     writer = csv.writer(f)
#     writer.writerow(["", "method", "total_distance(km)", "elapsed_time(s)", "optimize_rate(%)"])
#     for r in results_order_size:
#         optimize_rate_str = f"{r['optimize_rate']:.2f}%" if r['optimize_rate'] is not None else "-"
#         writer.writerow([r["n_orders"], r["method"], f"{r['total_distance']:.2f}", f"{r['elapsed_time']:.4f}", optimize_rate_str])

# 2. 固定订单数量 n=10，蚂蚁数量10/20/40变化
results_num_ants = []

num_ants_list = [10, 20, 40]
n_orders_fixed = 10

for num_ants in num_ants_list:
    print(f"\n===== 蚂蚁数量: {num_ants} =====")

    generator = PDPGenerator(num_orders=n_orders_fixed, coord_range=coord_range)
    data = generator.generate(batch_size=1)
    coords = data["locs"][0].numpy().tolist()
    distance_matrix = compute_distance_matrix2(coords)

    greedy_distance = None

    # 只测带蚂蚁的策略
    test_methods = {
        "aco": aco_policy,
        "greedy_then_aco": greedy_then_aco_policy,
        "greedy_then_mmas": greedy_then_mmas_policy
    }

    for method_name, policy_fn in test_methods.items():
        print(f"\n>>> 方法: {method_name}")

        env = PDPEnv(vehicle_capacity=vehicle_capacity)
        state = env.reset(data)

        start_time = time.time()
        final_state, trajs = rollout(env, state, distance_matrix, policy=lambda s, e, d: policy_fn(s, e, d, num_ants=num_ants, num_iters=30), max_steps=500)
        end_time = time.time()

        total_distance = final_state["total_distance"][0].item()
        elapsed_time = end_time - start_time

        optimize_rate = None
        if method_name != "greedy" and greedy_distance:
            optimize_rate = (greedy_distance - total_distance) / greedy_distance * 100

        results_num_ants.append({
            "num_ants": num_ants,
            "method": method_name,
            "total_distance": total_distance,
            "elapsed_time": elapsed_time,
            "optimize_rate": optimize_rate
        })

# 保存蚂蚁数量变化实验结果
with open("results/experiment_results_num_ants.csv", "w", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(["num_ants", "method", "total_distance(km)", "elapsed_time(s)", "optimize_rate(%)"])
    for r in results_num_ants:
        optimize_rate_str = f"{r['optimize_rate']:.2f}%" if r['optimize_rate'] is not None else "-"
        writer.writerow([r["num_ants"], r["method"], f"{r['total_distance']:.2f}", f"{r['elapsed_time']:.4f}", optimize_rate_str])

print("\n✅ 所有实验完成，结果保存在 results/ 文件夹下！")
