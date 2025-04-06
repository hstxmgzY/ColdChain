import React, { useState } from 'react';
import {
  Form,
  Input,
  Button,
  List,
  Card,
  Toast,
  NavBar,
  DatePicker
} from 'antd-mobile';
import { useNavigate } from 'react-router-dom';
import { LeftOutline } from 'antd-mobile-icons';
import { useUser } from '../../../contexts/UserContext';

const OrderCreate = () => {
  const { userInfo } = useUser();
  const navigate = useNavigate();

  const [form] = Form.useForm();
  const [orderItems, setOrderItems] = useState<any[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [deliveryDate, setDeliveryDate] = useState<string | null>(null);

  const updateTotalPrice = () => {
    const total = orderItems.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
    setTotalPrice(total);
  };

  const handleAddItem = () => {
    // 可改为跳转到 /order/items 页面
    const newItem = { productName: '', quantity: 1, unitPrice: 50 };
    setOrderItems([...orderItems, newItem]);
    updateTotalPrice();
  };

  const handleSubmitOrder = async () => {
    try {
      const values = await form.validateFields();
      const orderData = {
        ...values,
        delivery_date: deliveryDate,
        items: orderItems,
        totalPrice
      };
      console.log('提交订单数据：', orderData);
      Toast.show({ icon: 'success', content: '订单创建成功' });
      navigate('/order/confirm');
    } catch (error) {
      Toast.show({ icon: 'fail', content: '提交失败，请检查表单内容' });
    }
  };

  return (
    <div style={{ padding: 12 }}>
      <NavBar backArrow={<LeftOutline />} onBack={() => window.history.back()}>
        租赁订单创建
      </NavBar>

      <Form form={form} layout="vertical">

        {/* 发件人信息 */}
        <Card title="发件人信息" style={{ marginBottom: 16 }}>
          <Form.Item name={['sender_info', 'name']} label="姓名" rules={[{ required: true }]}>
            <Input placeholder="请输入发件人姓名" />
          </Form.Item>
          <Form.Item name={['sender_info', 'phone']} label="电话" rules={[{ required: true }]}>
            <Input placeholder="请输入发件人电话" maxLength={11} />
          </Form.Item>
          <Form.Item name={['sender_info', 'detail']} label="地址" rules={[{ required: true }]}>
            <Input placeholder="请输入发件人地址" />
          </Form.Item>
        </Card>

        {/* 收件人信息 */}
        <Card title="收件人信息" style={{ marginBottom: 16 }}>
          <Form.Item name={['receiver_info', 'name']} label="姓名" rules={[{ required: true }]}>
            <Input placeholder="请输入收件人姓名" />
          </Form.Item>
          <Form.Item name={['receiver_info', 'phone']} label="电话" rules={[{ required: true }]}>
            <Input placeholder="请输入收件人电话" maxLength={11} />
          </Form.Item>
          <Form.Item name={['receiver_info', 'detail']} label="地址" rules={[{ required: true }]}>
            <Input placeholder="请输入收件人地址" />
          </Form.Item>
        </Card>
      </Form>

      {/* 配送时间 */}
      <Card title="配送时间" style={{ marginBottom: 16 }}>
        <div style={{ padding: '12px 0' }}>
          <div style={{ marginBottom: 8, fontSize: 14, color: '#999' }}>请选择配送时间</div>
          <DatePicker
            value={deliveryDate ? new Date(deliveryDate) : undefined}
            onConfirm={val => {
              setDeliveryDate(val.toISOString());
            }}
          >
            {(value, actions) => (
              <Button block onClick={actions.open}>
                {value
                  ? new Date(value).toLocaleString()
                  : '点击选择时间'}
              </Button>
            )}
          </DatePicker>

        </div>
      </Card>

      {/* 订单备注 */}
      <Card title="订单备注" style={{ marginBottom: 16 }}>
        <Form.Item name="order_note" label="备注">
          <Input placeholder="例如：尽快配送" clearable />
        </Form.Item>
      </Card>

      {/* 商品信息 */}
      <Card title="订单商品" style={{ marginBottom: 16 }}>
        <Button block color="primary" onClick={handleAddItem}>添加商品</Button>
        <List style={{ marginTop: 12 }}>
          {orderItems.map((item, index) => (
            <List.Item key={index} extra={`${item.quantity * item.unitPrice} 元`}>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 14 }}>商品名称：</span>
                <Input
                  value={item.productName}
                  onChange={val => {
                    const newItems = [...orderItems];
                    newItems[index].productName = val;
                    setOrderItems(newItems);
                  }}
                />
              </div>
              <div style={{ marginBottom: 4 }}>
                <span style={{ fontSize: 14 }}>商品数量：</span>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={val => {
                    const newItems = [...orderItems];
                    newItems[index].quantity = parseInt(val) || 0;
                    setOrderItems(newItems);
                    updateTotalPrice();
                  }}
                />
              </div>
              <div>
                <span style={{ fontSize: 14 }}>单价：</span>{item.unitPrice} 元
              </div>
            </List.Item>
          ))}
        </List>
      </Card>

      {/* 总金额 */}
      <div style={{ marginBottom: 16 }}>
        <strong>订单总金额：</strong>{totalPrice} 元
      </div>

      {/* 提交 */}
      <Button block color="primary" onClick={handleSubmitOrder}>
        提交订单
      </Button>
    </div>
  );
};

export default OrderCreate;
