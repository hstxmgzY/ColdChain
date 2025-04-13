import requests
import time


API_KEY = "15807c9291055bcaaa80372f695f0ed0" 

def get_distance_via_amap(origin, destination):
    """
    使用高德地图驾车路径规划 API 获取真实驾车距离（单位：公里）。
    参数:
      origin: [lon, lat]（经度在前，纬度在后）
      destination: [lon, lat]
    返回:
      路径距离（单位：公里），出错时返回 None
    """
    url = "https://restapi.amap.com/v5/direction/driving"
    params = {
        "origin": f"{origin[0]:.6f},{origin[1]:.6f}",
        "destination": f"{destination[0]:.6f},{destination[1]:.6f}",
        "key": API_KEY,
        "strategy": 32,
        "output": "json"
    }
    try:
        time.sleep(0.2)
        response = requests.get(url, params=params)
        data = response.json()
        if data.get("info") == "OK" and data.get("route", {}).get("paths"):
            distance_m = float(data["route"]["paths"][0]["distance"])
            return distance_m / 1000.0
        else:
            print("高德 API 请求失败：", data.get("info", "未知错误"))
            return None
    except Exception as e:
        print("请求或解析高德地图 API 出错：", e)
        return None

def compute_distance_matrix(locs):
    """
    根据 locs 中所有节点对，预计算真实距离矩阵（单位：公里）。
    参数:
      locs: 数组，形状 (num_nodes, 2)，[lon, lat]
    返回:
      距离矩阵，二维列表，形状 (num_nodes, num_nodes)
    """
    num_nodes = len(locs)
    dist_matrix = [[0.0] * num_nodes for _ in range(num_nodes)]
    for i in range(num_nodes):
        for j in range(num_nodes):
            if i == j:
                continue
            distance = get_distance_via_amap(locs[i], locs[j])
            if distance is None:
                distance = 0.0
            dist_matrix[i][j] = distance
    return dist_matrix


def generate_static_map_url(locs, trajectory, api_key=API_KEY, zoom=12, size="750*400"):
    """
    生成高德静态地图 URL，展示路径轨迹
    参数：
      locs: numpy 数组，形状 (num_nodes, 2)，每个点是 [lon, lat]
      trajectory: List[int]，节点访问顺序
      api_key: 高德 Web API Key（默认使用顶部设置的全局 API_KEY）
    返回：
      可访问的静态地图 URL
    """
    # 路径折线参数
    path_coords = ";".join([f"{locs[i][0]:.6f},{locs[i][1]:.6f}" for i in trajectory])
    path_param = f"paths=5,0x0000FF,1,,:{path_coords}"

    # 标注点参数（最多10个）
    marker_list = []
    for idx, i in enumerate(trajectory[:10]):
        lon, lat = locs[i]
        marker_list.append(f"mid,0xFF0000,{idx}:{lon:.6f},{lat:.6f}")
    markers_param = "markers=" + "|".join(marker_list)

    # 拼接完整 URL
    url = (
        "https://restapi.amap.com/v3/staticmap?"
        f"zoom={zoom}&size={size}&{path_param}&{markers_param}&key={api_key}"
    )
    return url
