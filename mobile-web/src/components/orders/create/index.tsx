import React, { useState } from "react"
import {
  Form,
  Input,
  Button,
  List,
  Card,
  Toast,
  NavBar,
  DatePicker,
} from "antd-mobile"
import { useNavigate } from "react-router-dom"
import { LeftOutline } from "antd-mobile-icons"
import { useUser } from "../../../contexts/UserContext"
import { useDispatch, useSelector } from "react-redux"
import {
  setSenderInfo,
  setReceiverInfo,
  setDeliveryDate,
  setOrderNote,
  submitOrder,
} from "../../../store/reducers/order"
import { RootState } from "../../../store"

const OrderCreate = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const order = useSelector((state: RootState) => state.orders.order)
  const loading = useSelector((state: RootState) => state.orders.loading)
  const { userInfo } = useUser()

  const [form] = Form.useForm()
  if (loading) {
    return <div>Loading...</div>
  }

  // const [orderItems, setOrderItems] = useState<any[]>([])
  // const [totalPrice, setTotalPrice] = useState<number>(0)
  // const [deliveryDate, setDeliveryDate] = useState<string | null>(null)

  const handleAddItem = () => {
    navigate("/order/items")
  }

  const handleSubmitOrder = async () => {
    console.log("Submitting order:", order)
    try {
      await dispatch(submitOrder({ ...order }))
      Toast.show({ icon: "success", content: "订单提交成功" })
      navigate("/order/confirm")
    } catch {
      Toast.show({ icon: "fail", content: "提交失败" })
    }
  }

  return (
    <div style={{ padding: 12 }}>
      <NavBar
        backArrow={<LeftOutline />}
        onBack={() => window.history.back()}
      >
        租赁订单创建
      </NavBar>

      <Form form={form} layout="vertical">
        {/* 发件人信息 */}
        <Card title="发件人信息" style={{ marginBottom: 16 }}>
          <Form.Item
            name={["sender_info", "name"]}
            label="姓名"
            rules={[{ required: true }]}
          >
            <Input
              value={order.sender_info?.name || ""}
              onChange={(val) =>
                dispatch(
                  setSenderInfo({
                    ...order.sender_info,
                    name: val,
                  })
                )
              }
              placeholder="请输入发件人姓名"
            />
          </Form.Item>
          <Form.Item
            name={["sender_info", "phone"]}
            label="电话"
            rules={[{ required: true }]}
          >
            <Input
              value={order.sender_info?.phone || ''}
              onChange={val =>
                dispatch(setSenderInfo({ ...order.sender_info, phone: val }))
              }
              placeholder="请输入发件人电话" maxLength={11} />
          </Form.Item>
          <Form.Item
            name={["sender_info", "detail"]}
            label="地址"
            rules={[{ required: true }]}
          >
            <Input
              value={order.sender_info?.detail || ''}
              onChange={val =>
                dispatch(setSenderInfo({ ...order.sender_info, detail: val }))
              }
              placeholder="请输入发件人地址" />
          </Form.Item>
        </Card>

        {/* 收件人信息 */}
        <Card title="收件人信息" style={{ marginBottom: 16 }}>
          <Form.Item
            name={["receiver_info", "name"]}
            label="姓名"
            rules={[{ required: true }]}
          >
            <Input
              value={order.receiver_info?.name || ''}
              onChange={val =>
                dispatch(setReceiverInfo({ ...order.receiver_info, name: val }))
              }
              placeholder="请输入收件人姓名" />
          </Form.Item>
          <Form.Item
            name={["receiver_info", "phone"]}
            label="电话"
            rules={[{ required: true }]}
          >
            <Input
              value={order.receiver_info?.phone || ''}
              onChange={val =>
                dispatch(
                  setReceiverInfo({ ...order.receiver_info, phone: val })
                )
              }
              placeholder="请输入收件人电话" maxLength={11} />
          </Form.Item>
          <Form.Item
            name={["receiver_info", "detail"]}
            label="地址"
            rules={[{ required: true }]}
          >
            <Input
              value={order.receiver_info?.detail || ''}
              onChange={val =>
                dispatch(
                  setReceiverInfo({ ...order.receiver_info, detail: val })
                )
              }
              placeholder="请输入收件人地址" />
          </Form.Item>
        </Card>
      </Form>

      {/* 配送时间 */}
      <Card title="配送时间" style={{ marginBottom: 16 }}>
        <div style={{ padding: "12px 0" }}>
          <div
            style={{ marginBottom: 8, fontSize: 14, color: "#999" }}
          >
            请选择配送时间
          </div>
          <DatePicker
            precision="minute"
            value={order.delivery_date ? new Date(order.delivery_date) : undefined}
            onConfirm={(val) => {
              if (val) {
                dispatch(setDeliveryDate(val.toISOString()))
              }
            }}
          >
            {(value, actions) => (
              <Button block onClick={actions.open}>
                {value
                  ? new Date(value).toLocaleString()
                  : "点击选择时间"}
              </Button>
            )}
          </DatePicker>

        </div>
      </Card>

      {/* 订单备注 */}
      <Card title="订单备注" style={{ marginBottom: 16 }}>
        <Form.Item name="order_note" label="备注">
          <Input
            value={order.order_note}
            onChange={val => dispatch(setOrderNote(val))}
            placeholder="例如：尽快配送" clearable />
        </Form.Item>
      </Card>

      {/* 商品信息 */}
      <Card title="订单商品" style={{ marginBottom: 16 }}>
        <Button block color="primary" onClick={handleAddItem}>
          添加商品
        </Button>
        <List style={{ marginTop: 12 }}>
          {order.order_items.map((item, index) => (
            <List.Item
              key={index}
              extra={
                <Button
                  size="mini"
                  onClick={() => navigate(`/order/item/${index}`)}
                >
                  详情
                </Button>
              }
            >
              <div>
                {item.product.product_name} × {item.quantity}
              </div>
              <div style={{ color: '#999', fontSize: 12 }}>
                {item.product.category_name}
              </div>
            </List.Item>
          ))}
        </List>
      </Card>

      <Button block color="primary" onClick={handleSubmitOrder}>
        提交订单
      </Button>
    </div>
  )
}

export default OrderCreate
