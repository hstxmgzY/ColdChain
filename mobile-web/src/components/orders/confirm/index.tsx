import React from "react"
import { useSelector } from "react-redux"
import { RootState } from "../../../store"
import { Card, List, Button, NavBar, Toast } from "antd-mobile"
import { LeftOutline } from "antd-mobile-icons"
import { useNavigate } from "react-router-dom"

const OrderConfirm = () => {
    const navigate = useNavigate()
    const order = useSelector((state: RootState) => state.orders.order)

    const handleConfirm = () => {
        Toast.show({ icon: "success", content: "订单已确认，前往支付" })
        navigate("/order/pay")
    }

    return (
        <div style={{ padding: 12 }}>
            <NavBar backArrow={<LeftOutline />} onBack={() => navigate(-1)}>
                订单确认
            </NavBar>

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

            {/* 配送时间与备注 */}
            <Card title="配送信息" style={{ marginBottom: 12 }}>
                <List>
                    <List.Item title="配送时间">
                        {order.delivery_date
                            ? new Date(order.delivery_date).toLocaleString()
                            : "未选择"}
                    </List.Item>
                    <List.Item title="备注">{order.order_note || "无"}</List.Item>
                </List>
            </Card>

            {/* 商品信息 */}
            <Card title="订单商品" style={{ marginBottom: 12 }}>
                <List>
                    {order.order_items.map((item, index) => (
                        <List.Item key={index}>
                            <div style={{ fontWeight: 500 }}>
                                {item.product.product_name} × {item.quantity}
                            </div>
                            <div style={{ fontSize: 12, color: "#999" }}>
                                {item.product.category_name} | 温度：{item.product.min_temperature}~{item.product.max_temperature}℃
                                <br />
                                重量：{item.product.spec_weight}kg，体积：{item.product.spec_volume}m³
                            </div>
                        </List.Item>
                    ))}
                </List>
            </Card>

            {/* 提交按钮 */}
            <Button block color="primary" onClick={handleConfirm}>
                确认并前往支付
            </Button>
        </div>
    )
}

export default OrderConfirm
