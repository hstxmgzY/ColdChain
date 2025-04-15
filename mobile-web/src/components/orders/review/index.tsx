import React, { useEffect } from "react";
import { Card, List, NavBar, Tag, Button, Toast } from "antd-mobile";
import { LeftOutline } from "antd-mobile-icons";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../../store";
import { fetchOrdersByUser } from "../../../store/reducers/orderList";

const OrderReview = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const orders = useSelector((state: RootState) => state.orderList.list);
  const loading = useSelector((state: RootState) => state.orderList.loading);
  //   const state = useSelector((state: RootState) => state);
  //   console.log("Redux state keys:", Object.keys(state));

  useEffect(() => {
    if (userInfo?.user_id) {
      dispatch(fetchOrdersByUser(userInfo.user_id));
    } else {
      Toast.show({ icon: "fail", content: "未获取到用户信息" });
    }
  }, [userInfo, dispatch]);

  const handleCardClick = (orderId: number, status: string) => {
    if (status === "已发货") {
      navigate(`/order/delivery/${orderId}`);
    } else {
      navigate(`/order/detail/${orderId}`);
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <NavBar backArrow={<LeftOutline />} onBack={() => navigate(-1)}>
        我的订单
      </NavBar>

      {loading ? (
        <div style={{ textAlign: "center", marginTop: 50 }}>加载中...</div>
      ) : (
        orders.map((order) => (
          <Card
            key={order.id}
            title={`订单 #${order.order_number}`}
            extra={
              <Button
                size="mini"
                color="primary"
                fill="none"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick(order.id, order.status_name);
                }}
              >
                {order.status_name === "已发货" ? "配送信息" : "详情"}
              </Button>
            }
            style={{ marginBottom: 12 }}
            onClick={() => handleCardClick(order.id, order.status_name)}
          >
            <List>
              <List.Item title="发件人">{order.sender_info?.name}</List.Item>
              <List.Item title="收件人">{order.receiver_info?.name}</List.Item>
              <List.Item title="配送地址">
                {order.receiver_info?.detail}
              </List.Item>
              <List.Item
                title="状态"
                extra={
                  <Tag
                    color={
                      order.status_name === "已发货"
                        ? "success"
                        : order.status_name === "已支付"
                        ? "primary"
                        : "warning"
                    }
                  >
                    {order.status_name}
                  </Tag>
                }
              >
                租赁冷链箱数：{order.order_items?.length}
              </List.Item>
            </List>
          </Card>
        ))
      )}
    </div>
  );
};

export default OrderReview;
