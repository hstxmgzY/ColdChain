import requests
import time

API_KEY = "15807c9291055bcaaa80372f695f0ed0"

def address_to_location(address: str):
    """
    使用高德地图地理编码 API 将结构化地址转为经纬度 [lon, lat]。
    - 限流至 3 QPS（即每次请求前 sleep 0.34s）
    - 如果返回 CUQPS_HAS_EXCEEDED_THE_LIMIT，会等待并重试最多 3 次
    返回 None 表示解析失败。
    """
    url = "https://restapi.amap.com/v3/geocode/geo"
    params = {
        "key": API_KEY,
        "address": address,
        "output": "JSON"
    }
    info = ""
    for attempt in range(3):
        # 限流，保持 <=3 QPS
        time.sleep(0.34)
        try:
            resp = requests.get(url, params=params, timeout=5)
            j = resp.json()
        except Exception as e:
            info = str(e)
            continue

        info = j.get("info", "")
        # 如果是限流错误，等一秒再重试
        if info == "CUQPS_HAS_EXCEEDED_THE_LIMIT":
            time.sleep(1)
            continue

        # 正常成功
        if j.get("status") == "1" and j.get("geocodes"):
            loc = j["geocodes"][0]["location"]  # "116.480881,39.989410"
            lon, lat = map(float, loc.split(","))
            return [lon, lat]
        # 其它错误，直接退出重试
        break

    print(f"地理编码失败: {address} → {info}")
    return None

def get_distance_via_amap(origin, destination):
    """
    使用高德地图驾车路径规划 API 获取真实驾车距离（单位：公里）。
    """
    url = "https://restapi.amap.com/v5/direction/driving"
    params = {
        "origin": f"{origin[0]:.6f},{origin[1]:.6f}",
        "destination": f"{destination[0]:.6f},{destination[1]:.6f}",
        "key": API_KEY,
        "strategy": 32,
        "output": "JSON"
    }
    try:
        time.sleep(0.2)
        r = requests.get(url, params=params, timeout=5)
        j = r.json()
        if j.get("info") == "OK" and j.get("route", {}).get("paths"):
            return float(j["route"]["paths"][0]["distance"]) / 1000.0
    except Exception as e:
        print(f"请求高德驾车路径出错: {e}")
    return None

def compute_distance_matrix(locs):
    """
    预计算距离矩阵 (num_nodes x num_nodes)，单位：公里
    locs: [[lon, lat], ...]
    """
    n = len(locs)
    mat = [[0.0]*n for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i != j:
                d = get_distance_via_amap(locs[i], locs[j])
                mat[i][j] = d if d is not None else 0.0
    return mat
