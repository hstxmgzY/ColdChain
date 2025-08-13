# api.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple
from sqlalchemy import (
    create_engine, Column, BigInteger, String, DECIMAL, JSON, DateTime
)
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from map_api import address_to_location, compute_distance_matrix
from pdp_env import PDPEnv, rollout, greedy_policy
import torch
import numpy as np
import logging

# ---------- 数据库配置 ------------
DATABASE_URL = "mysql+pymysql://root:@localhost:3306/coldchain?charset=utf8mb4"

engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)
Base = declarative_base()

# ---------- ORM 模型 ----------
class Order(Base):
    __tablename__ = "rental_orders"
    id            = Column(BigInteger, primary_key=True, index=True)
    order_number = Column(String(24))
    user_id      = Column(BigInteger, index=True)
    status_id    = Column(BigInteger, index=True)
    total_price  = Column(DECIMAL)
    sender_info  = Column(JSON)    
    receiver_info= Column(JSON)
    delivery_date= Column(DateTime)
    order_note   = Column(String(255))

# ---------- 常量：仓库地址 ----------
DEPOT_ADDRESS = "浙江省宁波市镇海区同心路888号" 

# ---------- Pydantic 响应模型 ----------
class LocItem(BaseModel):
    position: List[float]  # [lon, lat]
    nodeType: int          # 0=仓库,1=取货,2=送货
    orderId:   int         # 订单索引

class RouteResponse(BaseModel):
    locs:          List[LocItem]
    trajectories:  List[List[int]]

app = FastAPI()


# 允许跨域
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],        # 允许所有来源
    allow_credentials=True,     # 是否带 Cookie
    allow_methods=["*"],        # 允许所有 HTTP 方法：GET, POST, …
    allow_headers=["*"],        # 允许所有请求头
)

def plan_route_from_pairs(pairs: List[Tuple[str,str]]) -> RouteResponse:
    """
    通用路径规划：从取货/送货地址对列表，返回 locs + trajectories。
    """
    # 1. 地理编码：先编码仓库
    depot_loc = address_to_location(DEPOT_ADDRESS)
    if not depot_loc:
        raise HTTPException(500, detail=f"仓库地址编码失败：{DEPOT_ADDRESS}")
    coords = [depot_loc]

    # 2. 地理编码：对每笔订单的取货&送货
    for i,(pu_addr, de_addr) in enumerate(pairs):
        pu = address_to_location(pu_addr)
        de = address_to_location(de_addr)
        if not pu or not de:
            raise HTTPException(500, detail=f"订单 {i} 地址解析失败")
        coords.append(pu)
        coords.append(de)

    # 3. 计算距离矩阵
    dist_mat = compute_distance_matrix(coords)

    # 4. 构造 PDPEnv 所需的数据
    num_orders = len(pairs)
    # node_type: [DEPOT] + [PICKUP, DELIVERY] * num_orders
    node_type = [0] + [1,2]*num_orders
    # order_map: depot->-1, pickup&delivery-> order index
    order_map = [-1] + [i for i in range(num_orders) for _ in (0,1)]
    # 随机负载（若不需要，可全设为1）
    order_load = torch.ones(num_orders, dtype=torch.int32)

    data = {
        "locs":       torch.tensor([coords], dtype=torch.float32),        # (1, N, 2)
        "node_type":  torch.tensor([node_type], dtype=torch.int64),       # (1, N)
        "order_map":  torch.tensor([order_map], dtype=torch.int64),       # (1, N)
        "order_load": order_load.unsqueeze(0),                             # (1, num_orders)
        "num_orders": num_orders
    }

    # 5. 路径规划 Rollout
    env   = PDPEnv(vehicle_capacity=999999)  # 若无容量限制，可设大
    state = env.reset(data)
    _, trajs = rollout(env, state, dist_mat, policy=greedy_policy, max_steps=1000)
    full_traj = trajs[0]  # 车辆完整访问序列

    # 6. 按送货节点出现顺序拆分成每笔订单的轨迹
    segments = []
    prev_idx = -1
    for idx, node in enumerate(full_traj):
        # nodeType==2 => 送货节点
        if node_type[node] == 2:
            if prev_idx < 0:
                # 第一笔：从 depot(0) 开始到本次
                seg = [0] + full_traj[:idx+1]
            else:
                # 后续：从上次送货节点开始到本次
                seg = [ full_traj[prev_idx] ] + full_traj[prev_idx+1:idx+1]
            segments.append(seg)
            prev_idx = idx

    # 7. 组织 locs 输出
    locs_out = []
    for i,(lon,lat) in enumerate(coords):
        locs_out.append(LocItem(
            position=[lon,lat],
            nodeType=node_type[i],
            orderId=order_map[i]
        ))

    return RouteResponse(locs=locs_out, trajectories=segments)

logger = logging.getLogger("uvicorn.error")

@app.get("/routes/all", response_model=RouteResponse)
def get_all_routes():

    db: Session = SessionLocal()
    try:
        orders = db.query(Order).filter(Order.status_id == 3).all()
    finally:
        db.close()

    # —— 校验环节 —— 
    count = len(orders)
    if count == 0:
        # 如果没有任何订单，直接返回空结果或者抛错
        logger.warning("get_all_routes: 未查询到 status_id=3 的订单！")
        raise HTTPException(status_code=404, detail="没有待配送的订单")
    else:
        logger.info(f"get_all_routes: 成功查询到 {count} 个待配送订单")

    # 提取地址对
    pairs: List[Tuple[str,str]] = [
        (o.sender_info.get("detail",""), o.receiver_info.get("detail",""))
        for o in orders
    ]

    # 继续路径规划
    return plan_route_from_pairs(pairs)

@app.get("/routes/user/{user_id}", response_model=RouteResponse)
def get_user_routes(user_id: int):
    """
    返回指定 user_id 且 status_id=3 的订单路径规划结果
    """
    db = SessionLocal()
    try:
        orders = (
            db.query(Order)
              .filter(Order.status_id == 3, Order.user_id == user_id)
              .all()
        )
        pairs = [
            (o.sender_info.get("detail",""), o.receiver_info.get("detail",""))
            for o in orders
        ]
    finally:
        db.close()
    return plan_route_from_pairs(pairs)
