# 文件名：generate_path_plots.py
import matplotlib.pyplot as plt
import numpy as np
import torch
import os
from pdp_env import PDPEnv, rollout, greedy_policy, aco_policy, greedy_then_aco_policy, greedy_then_mmas_policy
from pdp_generator import PDPGenerator
from map_api import compute_distance_matrix2
import matplotlib
import matplotlib.patches as mpatches

# 强制手动指定字体路径
from matplotlib.font_manager import FontProperties


# 手动指定字体为系统中的「苹方」或其他中文字体
chinese_font = FontProperties(fname="/System/Library/Fonts/Hiragino Sans GB.ttc")

# 全局设置中文字体
matplotlib.rcParams['font.family'] = chinese_font.get_name()

# 允许负号 '-' 显示正常
matplotlib.rcParams['axes.unicode_minus'] = False

os.makedirs("results/path_plots", exist_ok=True)

def jitter_coords(coords, scale=0.001):
    jittered = coords + np.random.uniform(-scale, scale, coords.shape)
    return jittered

def draw_path(coords, trajectory, node_type, title, save_path):
    import matplotlib.patches as mpatches

    coords = np.array(coords)
    if trajectory[0] != 0:
        trajectory = [0] + trajectory
    path_coords = coords[trajectory]

    fig, ax = plt.subplots(figsize=(7.5, 6))  # 为右侧图例预留空间

    for i, (xi, yi) in enumerate(coords):
        t = node_type[i]

        # 设置不同类型的样式
        if t == 0:  # 仓库
            color, shape = 'black', 'round,pad=0.2'
            offset = (0.0, 0.0)
        elif t == 1:  # 取货点
            color, shape = 'blue', 'square,pad=0.3'
            offset = (0.0, 0.002)  # 向上偏移
        elif t == 2:  # 送货点
            color, shape = 'red', 'square,pad=0.3'
            offset = (0.0, -0.002)  # 向下偏移

        # 标号文本偏移
        ax.text(
            xi + offset[0],
            yi + offset[1],
            str(i),
            fontsize=9,
            ha='center',
            va='center',
            color=color,
            bbox=dict(facecolor='white', edgecolor=color, boxstyle=shape)
        )

    # 路径连线不扰动，确保真实
    ax.plot(path_coords[:, 0], path_coords[:, 1], color='green', linestyle='-')

    ax.set_title(title)
    ax.set_xlabel("经度")
    ax.set_ylabel("纬度")
    ax.grid(True)

    # 图例放右侧
    legend_elements = [
        mpatches.FancyBboxPatch((0, 0), 1, 1, boxstyle="round,pad=0.2", edgecolor='black', facecolor='white', label='仓库'),
        mpatches.FancyBboxPatch((0, 0), 1, 1, boxstyle="square,pad=0.3", edgecolor='blue', facecolor='white', label='取货点'),
        mpatches.FancyBboxPatch((0, 0), 1, 1, boxstyle="square,pad=0.3", edgecolor='red', facecolor='white', label='送货点'),
    ]
    ax.legend(
        handles=legend_elements,
        loc='center left',
        bbox_to_anchor=(1.02, 0.5),
        borderaxespad=0,
        frameon=True
    )

    plt.savefig(save_path, bbox_inches='tight')
    plt.close()


methods = {
    "greedy": greedy_policy,
    "aco": aco_policy,
    "greedy_then_aco": greedy_then_aco_policy,
    "greedy_then_mmas": greedy_then_mmas_policy
}

vehicle_capacity = 999999
coord_range = ((121.2, 121.8), (29.7, 30.0))
n_orders = 10
num_ants = 20
num_iters = 30

generator = PDPGenerator(num_orders=n_orders, coord_range=coord_range)
data = generator.generate(batch_size=1)
coords = data["locs"][0].numpy().tolist()
distance_matrix = compute_distance_matrix2(coords)

env = PDPEnv(vehicle_capacity=vehicle_capacity)
for method_name, policy_fn in methods.items():
    state = env.reset(data)
    kwargs = {"num_ants": num_ants, "num_iters": num_iters} if "aco" in method_name else {}
    final_state, trajs = rollout(env, state, distance_matrix, policy=lambda s, e, d: policy_fn(s, e, d, **kwargs), max_steps=500)
    save_path = f"results/path_plots/{method_name}_path.png"
    draw_path(
    coords=coords,
    trajectory=trajs[0],
    node_type=data["node_type"][0].tolist(),
    title=f"{method_name} 策略路径图",
    save_path=save_path
)

print("✅ 所有路径图已绘制完毕，保存在 results/path_plots/ 文件夹中。")
