import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  List,
  Card,
  Toast,
  NavBar,
  DatePicker,
  TextArea,
} from "antd-mobile";
import { useNavigate } from "react-router-dom";
import { LeftOutline } from "antd-mobile-icons";
import { useUser } from "../../../contexts/UserContext";
import { useDispatch, useSelector } from "react-redux";
import {
  setSenderInfo,
  setReceiverInfo,
  setDeliveryDate,
  setOrderNote,
  submitOrder,
} from "../../../store/reducers/order";
import { RootState } from "../../../store";
import { Address } from "../../../interface/user/user";

const OrderCreate = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const order = useSelector((state: RootState) => state.order.order);
  const loading = useSelector((state: RootState) => state.order.loading);
  const { userInfo } = useUser();

  const [form] = Form.useForm();
  const [showSenderAddressList, setShowSenderAddressList] = useState(false);
  const [showReceiverAddressList, setShowReceiverAddressList] = useState(false);
  const [selectedSenderAddress, setSelectedSenderAddress] =
    useState<string>("");
  const [selectedReceiverAddress, setSelectedReceiverAddress] =
    useState<string>("");
  const [selectedSenderName, setSelectedSenderName] = useState<string>("");
  const [selectedSenderPhone, setSelectedSenderPhone] = useState<string>("");
  const [selectedReceiverName, setSelectedReceiverName] = useState<string>("");
  const [selectedReceiverPhone, setSelectedReceiverPhone] =
    useState<string>("");

  if (loading) {
    return <div>Loading...</div>;
  }

  const handleAddItem = () => {
    navigate("/order/items");
  };

  const handleSubmitOrder = async () => {
    // 获取当前登录的用户信息
    const currentUser = userInfo;

    // 格式化 delivery_date 为后端所需的格式 "YYYY-MM-DD HH:mm"
    const formattedDeliveryDate = new Date(order.delivery_date)
      .toISOString()
      .slice(0, 16) // 获取到 "YYYY-MM-DDTHH:mm"
      .replace("T", " "); // 替换掉 "T" 为一个空格，符合后端格式 "YYYY-MM-DD HH:mm"

    // 提取发件人和收件人的信息
    const senderInfo = {
      name: selectedSenderName || order.sender_info?.name || "",
      phone: selectedSenderPhone || order.sender_info?.phone || "",
      detail: selectedSenderAddress || order.sender_info?.detail || "",
    };

    const receiverInfo = {
      name: selectedReceiverName || order.receiver_info?.name || "",
      phone: selectedReceiverPhone || order.receiver_info?.phone || "",
      detail: selectedReceiverAddress || order.receiver_info?.detail || "",
    };

    // 构建新的订单对象符合后端所需格式
    const updatedOrder = {
      user_id: currentUser.user_id,
      sender_info: senderInfo,
      receiver_info: receiverInfo,
      delivery_date: formattedDeliveryDate, // 使用格式化后的日期
      order_note: order.order_note || "",
      order_items: order.order_items.map((item) => ({
        quantity: parseInt(item.quantity, 10), // 确保 quantity 是整数
        product: {
          product_name: item.product.product_name,
          category_name: item.product.category_name,
          min_temperature: parseFloat(item.product.min_temperature), // 确保 min_temperature 是浮动数值
          max_temperature: parseFloat(item.product.max_temperature), // 确保 max_temperature 是浮动数值
          spec_weight: parseFloat(item.product.spec_weight), // 确保 spec_weight 是浮动数值
          spec_volume: parseFloat(item.product.spec_volume), // 确保 spec_volume 是浮动数值
          image_url: item.product.image_url,
        },
      })),
    };

    // console.log("Submitting order:", updatedOrder);

    try {
      await dispatch(submitOrder(updatedOrder)); // 提交符合后端格式的订单
      Toast.show({ icon: "success", content: "订单提交成功" });
      navigate("/order/confirm");
    } catch {
      Toast.show({ icon: "fail", content: "提交失败" });
    }
  };

  const handleSelectSenderAddress = (address: Address) => {
    // console.log("Selected address:", address);
    setSelectedSenderAddress(address.detail);
    setSelectedSenderName(address.name);
    setSelectedSenderPhone(address.phone);
    dispatch(
      setSenderInfo({
        ...order.sender_info,
        name: address.name,
        phone: address.phone,
        detail: address.detail,
      })
    );
    setShowSenderAddressList(false);
  };

  const handleSelectReceiverAddress = (address: Address) => {
    setSelectedReceiverAddress(address.detail);
    setSelectedReceiverName(address.name);
    setSelectedReceiverPhone(address.phone);
    dispatch(
      setReceiverInfo({
        ...order.receiver_info,
        name: address.name,
        phone: address.phone,
        detail: address.detail,
      })
    );
    setShowReceiverAddressList(false);
  };

  // console.log(userInfo);

  return (
    <div style={{ padding: 12 }}>
      <NavBar backArrow={<LeftOutline />} onBack={() => window.history.back()}>
        租赁订单创建
      </NavBar>

      <Form form={form} layout="vertical">
        {/* 发件人信息 */}
        <Card title="发件人信息" style={{ marginBottom: 16 }}>
          <Button
            style={{ marginTop: 8 }}
            block
            onClick={() => setShowSenderAddressList(true)}
          >
            选择发件人地址
          </Button>
          <Form.Item
            // name={["sender_info", "name"]}
            label="姓名"
            rules={[{ required: true }]}
          >
            <Input
              value={selectedSenderName || order.sender_info?.name || ""}
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
            &nbsp;
          </Form.Item>

          <Form.Item
            // name={["sender_info", "phone"]}
            label="电话"
            rules={[{ required: true }]}
          >
            <Input
              value={selectedSenderPhone || order.sender_info?.phone || ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedSenderPhone(val); // 更新本地状态
                dispatch(
                  setSenderInfo({
                    ...order.sender_info,
                    phone: val, // 更新 Redux 中的 sender_info
                  })
                );
              }}
              placeholder="请输入发件人电话"
              maxLength={11}
            />
            &nbsp;
          </Form.Item>

          <Form.Item
            // name={["sender_info", "detail"]}
            label="地址"
            rules={[{ required: true }]}
          >
            <TextArea
              value={selectedSenderAddress || order.sender_info?.detail || ""}
              onChange={(val) =>
                dispatch(
                  setSenderInfo({
                    ...order.sender_info,
                    detail: val,
                  })
                )
              }
              placeholder="请输入发件人地址"
              autoSize={{ minRows: 1, maxRows: 6 }}
            />
            &nbsp;
          </Form.Item>
        </Card>
        {/* 收件人信息 */}
        <Card title="收件人信息" style={{ marginBottom: 16 }}>
          <Button
            style={{ marginTop: 8 }}
            block
            onClick={() => setShowReceiverAddressList(true)}
          >
            选择收件人地址
          </Button>
          <Form.Item
            // name={["receiver_info", "name"]}
            label="姓名"
            rules={[{ required: true }]}
          >
            <Input
              value={selectedReceiverName || order.receiver_info?.name || ""}
              onChange={(val) =>
                dispatch(
                  setReceiverInfo({
                    ...order.receiver_info,
                    name: val,
                  })
                )
              }
              placeholder="请输入收件人姓名"
            />
            &nbsp;
          </Form.Item>

          <Form.Item
            // name={["receiver_info", "phone"]}
            label="电话"
            rules={[{ required: true }]}
          >
            <Input
              value={selectedReceiverPhone || order.receiver_info?.phone || ""}
              onChange={(e) => {
                const val = e.target.value;
                setSelectedReceiverPhone(val); // 更新本地状态
                dispatch(
                  setReceiverInfo({
                    ...order.receiver_info,
                    phone: val, // 更新 Redux 中的 receiver_info
                  })
                );
              }}
              placeholder="请输入收件人电话"
              maxLength={11}
            />
            &nbsp;
          </Form.Item>

          <Form.Item
            // name={["receiver_info", "detail"]}
            label="地址"
            rules={[{ required: true }]}
          >
            <TextArea
              value={
                selectedReceiverAddress || order.receiver_info?.detail || ""
              }
              onChange={(val) =>
                dispatch(
                  setReceiverInfo({
                    ...order.receiver_info,
                    detail: val,
                  })
                )
              }
              placeholder="请输入收件人地址"
              autoSize={{ minRows: 1, maxRows: 6 }}
            />
            &nbsp;
          </Form.Item>
        </Card>
      </Form>

      {/* 配送时间 */}
      <Card title="配送时间" style={{ marginBottom: 16 }}>
        <div style={{ padding: "12px 0" }}>
          <div style={{ marginBottom: 8, fontSize: 14, color: "#999" }}>
            请选择配送时间
          </div>
          <DatePicker
            precision="minute"
            value={
              order.delivery_date ? new Date(order.delivery_date) : undefined
            }
            onConfirm={(val) => {
              if (val) {
                dispatch(setDeliveryDate(val.toISOString()));
              }
            }}
          >
            {(value, actions) => (
              <Button block onClick={actions.open}>
                {value ? new Date(value).toLocaleString() : "点击选择时间"}
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
            onChange={(val) => dispatch(setOrderNote(val))}
            placeholder="例如：尽快配送"
            clearable
          />
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
              <div style={{ color: "#999", fontSize: 12 }}>
                {item.product.category_name}
              </div>
            </List.Item>
          ))}
        </List>
      </Card>

      <Button block color="primary" onClick={handleSubmitOrder}>
        提交订单
      </Button>

      {showSenderAddressList && (
        <div
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ padding: 20, background: "white", height: "100%" }}>
            <h3>选择地址</h3>
            <List>
              {userInfo?.address.map((address, index) => (
                <List.Item
                  key={index}
                  onClick={() => handleSelectSenderAddress(address)}
                >
                  {address.name} - {address.detail}
                </List.Item>
              ))}
            </List>
            <Button
              block
              color="danger"
              onClick={() => setShowSenderAddressList(false)}
            >
              关闭
            </Button>
          </div>
        </div>
      )}

      {showReceiverAddressList && (
        <div
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div style={{ padding: 20, background: "white", height: "100%" }}>
            <h3>选择地址</h3>
            <List>
              {userInfo?.address.map((address, index) => (
                <List.Item
                  key={index}
                  onClick={() => handleSelectReceiverAddress(address)}
                >
                  {address.name} - {address.detail}
                </List.Item>
              ))}
            </List>
            <Button
              block
              color="danger"
              onClick={() => setShowSenderAddressList(false)}
            >
              关闭
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderCreate;
