import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "../../../store";
import { Card, List, Button, NavBar, Toast, Space } from "antd-mobile";
import { LeftOutline } from "antd-mobile-icons";
import { useNavigate } from "react-router-dom";
import { updatePaiedStatus } from "../../../api/modules/order/order"; // 确保路径正确

const OrderPay = () => {
  const order = useSelector((state: RootState) => state.order.order);
  const navigate = useNavigate();

  const totalPrice = order.order_items.reduce(
    (acc, item) => acc + item.quantity * 50, // 假设每件50元（模拟用）
    0
  );

  // const handlePay = (type: "wechat" | "alipay") => {
  //   Toast.show({
  //     icon: "loading",
  //     content: `正在使用${type === "wechat" ? "微信" : "支付宝"}支付...`,
  //     duration: 1000,
  //   });

  //   setTimeout(() => {
  //     Toast.show({
  //       icon: "success",
  //       content: "支付成功",
  //     });
  //     navigate("/order/complete");
  //   }, 1000);
  // };

  const handlePay = async (type: "wechat" | "alipay") => {
    Toast.show({
      icon: "loading",
      content: `正在使用${type === "wechat" ? "微信" : "支付宝"}支付...`,
      duration: 1000,
    });

    setTimeout(async () => {
      try {
        console.log(order);
        await updatePaiedStatus(order.id); // 调用支付状态更新 API
        Toast.show({
          icon: "success",
          content: "支付成功",
        });
        navigate("/order/complete");
      } catch (error) {
        console.error("支付状态更新失败：", error);
        Toast.show({
          icon: "fail",
          content: "更新订单状态失败",
        });
      }
    }, 1000);
  };

  return (
    <div style={{ padding: 12 }}>
      <NavBar backArrow={<LeftOutline />} onBack={() => navigate(-1)}>
        订单支付
      </NavBar>

      {/* 订单摘要 */}
      <Card title="支付信息" style={{ marginBottom: 16 }}>
        <List>
          <List.Item title="发件人">{order.sender_info?.name}</List.Item>
          <List.Item title="收件人">{order.receiver_info?.name}</List.Item>
          <List.Item title="配送时间">
            {order.delivery_date
              ? new Date(order.delivery_date).toLocaleString()
              : "未设置"}
          </List.Item>
          <List.Item title="备注">{order.order_note || "无"}</List.Item>
          <List.Item title="总金额">
            <span style={{ color: "#ff4d4f", fontWeight: 600 }}>
              ￥{totalPrice.toFixed(2)}
            </span>
          </List.Item>
        </List>
      </Card>

      {/* 支付方式 */}
      <Card title="请选择支付方式">
        <Space direction="vertical" block>
          <Button block color="primary" onClick={() => handlePay("wechat")}>
            微信支付
          </Button>
          <Button block color="warning" onClick={() => handlePay("alipay")}>
            支付宝支付
          </Button>
        </Space>
      </Card>
    </div>
  );
};

export default OrderPay;
