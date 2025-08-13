from PIL import Image
import os

method_names = ["greedy", "aco", "greedy_then_aco", "greedy_then_mmas"]
image_paths = [f"results/path_plots/{name}_path.png" for name in method_names]

images = [Image.open(p) for p in image_paths]
w, h = images[0].size

# 不预留顶部空间，直接拼 2x2 图像
combined = Image.new("RGB", (2 * w, 2 * h), "white")

positions = [(0, 0), (w, 0), (0, h), (w, h)]
for img, pos in zip(images, positions):
    combined.paste(img, pos)

save_path = "results/path_plots/all_methods_grid.png"
combined.save(save_path)
print(f"✅ 拼图已保存到：{save_path}")
