import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, List, NavBar, Image, Tag } from "antd-mobile";
import { LeftOutline } from "antd-mobile-icons";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const orders = useSelector((state: RootState) => state.orderList.list);
  const order = orders.find((o) => o.id === Number(id));

  if (!order) {
    return <div style={{ padding: 20 }}>未找到该订单</div>;
  }

  return (
    <div style={{ padding: 12 }}>
      <NavBar backArrow={<LeftOutline />} onBack={() => navigate(-1)}>
        订单详情
      </NavBar>

      {/* 基本信息 */}
      <Card title="订单信息" style={{ marginBottom: 12 }}>
        <List>
          <List.Item title="订单编号">{order.order_number}</List.Item>
          <List.Item title="配送时间">
            {order.delivery_date
              ? new Date(order.delivery_date).toLocaleString()
              : "暂无"}
          </List.Item>
          <List.Item title="备注">{order.order_note || "无"}</List.Item>
          <List.Item title="状态">
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
          </List.Item>
        </List>
      </Card>

      {/* 发件人信息 */}
      <Card title="发件人信息" style={{ marginBottom: 12 }}>
        <List>
          <List.Item title="姓名">{order.sender_info?.name}</List.Item>
          <List.Item title="电话">{order.sender_info?.phone}</List.Item>
          <List.Item title="地址">{order.sender_info?.detail}</List.Item>
        </List>
      </Card>

      {/* 收件人信息 */}
      <Card title="收件人信息" style={{ marginBottom: 12 }}>
        <List>
          <List.Item title="姓名">{order.receiver_info?.name}</List.Item>
          <List.Item title="电话">{order.receiver_info?.phone}</List.Item>
          <List.Item title="地址">{order.receiver_info?.detail}</List.Item>
        </List>
      </Card>

      {/* 商品信息 */}
      <Card title="商品信息">
        <List>
          {order.order_items?.map((item, index) => (
            <List.Item key={index}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Image
                  src={item.product?.image_url}
                  width={60}
                  height={60}
                  fit="cover"
                  style={{ borderRadius: 8 }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 500 }}>
                    {item.product?.product_name} × {item.quantity}
                  </div>
                  <div style={{ fontSize: 12, color: "#999" }}>
                    {item.product?.category_name}
                    {" / "}
                    温度：{item.product?.min_temperature}~
                    {item.product?.max_temperature}℃{" / "}
                    {item.product?.spec_weight}kg
                  </div>
                </div>
              </div>
            </List.Item>
          ))}
        </List>
      </Card>
    </div>
  );
};

export default OrderDetail;
