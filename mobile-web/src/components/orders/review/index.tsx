import React from "react"
import { Card, List, NavBar, Tag, Button } from "antd-mobile"
import { LeftOutline } from "antd-mobile-icons"
import { useNavigate } from "react-router-dom"

const mockOrders = [
    {
        id: 1,
        sender: "张三",
        receiver: "李四",
        delivery_date: "2025-04-08 15:00",
        items_count: 3,
        status_name: "已支付",
    },
    {
        id: 2,
        sender: "王五",
        receiver: "赵六",
        delivery_date: "2025-04-09 10:30",
        items_count: 2,
        status_name: "待支付",
    },
    {
        id: 3,
        sender: "赵七",
        receiver: "钱八",
        delivery_date: "2025-04-10 11:00",
        items_count: 1,
        status_name: "已发货",
    },
]

const OrderReview = () => {
    const navigate = useNavigate()

    const handleCardClick = (order: typeof mockOrders[0]) => {
        if (order.status_name === "已发货") {
            navigate(`/order/delivery/${order.id}`)
        } else {
            navigate(`/order/detail/${order.id}`)
        }
    }

    return (
        <div style={{ padding: 12 }}>
            <NavBar backArrow={<LeftOutline />} onBack={() => navigate(-1)}>
                我的订单
            </NavBar>

            {mockOrders.map((order) => (
                <Card
                    key={order.id}
                    title={`订单 #${order.id}`}
                    extra={
                        <Button
                            size="mini"
                            color="primary"
                            fill="none"
                            onClick={(e) => {
                                e.stopPropagation()
                                handleCardClick(order)
                            }}
                        >
                            {order.status_name === "已发货" ? "配送信息" : "详情"}
                        </Button>
                    }
                    style={{ marginBottom: 12 }}
                    onClick={() => handleCardClick(order)}
                >
                    <List>
                        <List.Item title="发件人">{order.sender}</List.Item>
                        <List.Item title="收件人">{order.receiver}</List.Item>
                        <List.Item title="配送时间">{order.delivery_date}</List.Item>
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
                            商品数：{order.items_count}
                        </List.Item>
                    </List>
                </Card>
            ))}
        </div>
    )
}

export default OrderReview
