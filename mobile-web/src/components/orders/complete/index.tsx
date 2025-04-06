import React from "react"
import { Button, Result, Space} from "antd-mobile"
import { SmileOutline } from "antd-mobile-icons"
import { useNavigate } from "react-router-dom"

const OrderComplete = () => {
    const navigate = useNavigate()

    return (
        <div style={{ padding: 24 }}>
            <h2 style={{ fontSize: 16, fontWeight: 600, textAlign: "center", marginBottom: 16 }}>
                支付成功!
            </h2>
            <Result
                icon={<SmileOutline style={{ fontSize: 64, color: '#00b578' }} />}
                status="success"
                title="支付成功"
                description="您的订单已提交，我们将尽快为您发货"
            />

            <Space direction="vertical" block style={{ marginTop: 24 }}>
                <Button block color="primary" onClick={() => navigate("/")}>
                    返回首页
                </Button>
                <Button block onClick={() => navigate("/order/review")}>
                    查看订单
                </Button>
            </Space>
        </div>
    )
}

export default OrderComplete
