import React from 'react'
import { Form, Input, Button, Card, NavBar, Toast } from 'antd-mobile'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { LeftOutline } from 'antd-mobile-icons'
import { addItem } from '../../../../store/reducers/order'

const OrderItemForm = () => {
    const [form] = Form.useForm()
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields()

            // 设置默认单价（如果需要）
            const item = {
                quantity: values.quantity,
                product: {
                    ...values.product,
                }
            }

            dispatch(addItem(item))
            Toast.show({ icon: 'success', content: '商品已添加' })
            navigate('/order/create')
        } catch {
            Toast.show({ icon: 'fail', content: '请完善商品信息' })
        }
    }

    return (
        <div style={{ padding: 12 }}>
            <NavBar backArrow={<LeftOutline />} onBack={() => navigate(-1)}>
                添加商品
            </NavBar>

            <Form form={form} layout="vertical">
                <Card title="基本信息" style={{ marginBottom: 16 }}>
                    <Form.Item name={["product", "product_name"]} label="商品名称" rules={[{ required: true }]}>
                        <Input placeholder="请输入商品名称" />
                    </Form.Item>
                    <Form.Item name={["product", "category_name"]} label="分类" rules={[{ required: true }]}>
                        <Input placeholder="如：电子产品" />
                    </Form.Item>
                    <Form.Item name="quantity" label="数量" rules={[{ required: true }]}>
                        <Input type="number" placeholder="数量" />
                    </Form.Item>
                </Card>

                <Card title="温控信息" style={{ marginBottom: 16 }}>
                    <Form.Item name={["product", "min_temperature"]} label="最低温度">
                        <Input type="number" placeholder="℃" />
                    </Form.Item>
                    <Form.Item name={["product", "max_temperature"]} label="最高温度">
                        <Input type="number" placeholder="℃" />
                    </Form.Item>
                </Card>

                <Card title="规格" style={{ marginBottom: 16 }}>
                    <Form.Item name={["product", "spec_weight"]} label="重量 (kg)">
                        <Input type="number" placeholder="如 0.5" />
                    </Form.Item>
                    <Form.Item name={["product", "spec_volume"]} label="体积 (m³)">
                        <Input type="number" placeholder="如 0.02" />
                    </Form.Item>
                </Card>

                <Card title="图片" style={{ marginBottom: 16 }}>
                    <Form.Item name={["product", "image_url"]} label="图片链接">
                        <Input placeholder="如 /images/xxx.jpg" />
                    </Form.Item>
                </Card>
            </Form>

            <Button block color="primary" onClick={handleSubmit}>
                添加到订单
            </Button>
        </div>
    )
}

export default OrderItemForm