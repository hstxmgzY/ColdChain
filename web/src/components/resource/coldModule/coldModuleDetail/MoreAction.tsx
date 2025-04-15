import React, { useState, useEffect } from "react";
import type { MenuProps, InputNumberProps, SliderSingleProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  Button,
  Dropdown,
  Modal,
  Col,
  InputNumber,
  Row,
  Slider,
  Input,
  Typography,
  Table,
} from "antd";

interface Order {
  key: string;
  orderNo: string;
  customer: string;
  productName: string;
}

const mockOrders: Order[] = [
  {
    key: "1",
    orderNo: "ORD-1744612084791919000",
    customer: "陈一波",
    productName: "梭子蟹",
  },
  {
    key: "2",
    orderNo: "ORD-1744615005711632000",
    customer: "姚婉欣",
    productName: "巧乐兹",
  },
  {
    key: "3",
    orderNo: "ORD-1744615005713244000",
    customer: "姚婉欣",
    productName: "小青龙",
  },
];

const LeaseOrderSetting: React.FC = () => {
  const [inputValue, setInputValue] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [filteredOrders, setFilteredOrders] = useState(mockOrders);

  // 过滤订单数据
  useEffect(() => {
    const filtered = mockOrders.filter((order) =>
      order.orderNo.toLowerCase().includes(inputValue.toLowerCase())
    );
    setFilteredOrders(filtered);
  }, [inputValue]);

  const columns: ColumnsType<Order> = [
    {
      title: "订单编号",
      dataIndex: "orderNo",
      key: "orderNo",
      width: 250,
    },
    {
      title: "用户名称",
      dataIndex: "customer",
      key: "customer",
    },
    {
      title: "产品名称",
      dataIndex: "productName",
      key: "productName",
    },
  ];

  const handleSelectOrder = (orderNo: string) => {
    setInputValue(orderNo);
    setShowTable(false);
  };

  return (
    <div style={{ position: "relative", width: "100%" }}>
      <Input
        placeholder="请输入订单编号"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          setShowTable(true);
        }}
        onFocus={() => setShowTable(true)}
        style={{ width: "100%" }}
        variant="underlined"
      />

      {showTable && (
        <div
          style={{
            position: "absolute",
            width: "100%",
            marginTop: 8,
            zIndex: 1000,
            boxShadow: "0 3px 6px -4px rgba(0,0,0,0.12)",
            border: "1px solid #f0f0f0",
            borderRadius: 4,
            background: "white",
          }}
        >
          <Table<Order>
            columns={columns}
            dataSource={filteredOrders}
            pagination={false}
            size="small"
            onRow={(record) => ({
              onClick: () => handleSelectOrder(record.orderNo),
              style: {
                cursor: "pointer",
                ":hover": { background: "#f5f5f5" },
              },
            })}
            scroll={{ y: 240 }}
            bordered={false}
          />
        </div>
      )}
    </div>
  );
};

const TemperatureSetting: React.FC = () => {
  const [inputTemperatureValue, setTemperatureInputValue] = useState(1);

  const onChangeTemperature: InputNumberProps["onChange"] = (newValue) => {
    setTemperatureInputValue(newValue as number);
  };

  const marks: SliderSingleProps["marks"] = {
    [-40]: "-40°C",
    [-30]: "-30°C",
    [-20]: "-20°C",
    [-10]: "-10°C",
    0: "0°C",
    10: "10°C",
    20: "20°C",
  };

  return (
    <Row
      align="middle"
      justify="space-between"
      style={{ width: "100%", padding: "16px 0" }}
    >
      <Col span={18}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Slider
            min={-40}
            max={20}
            marks={marks}
            onChange={onChangeTemperature}
            value={
              typeof inputTemperatureValue === "number"
                ? inputTemperatureValue
                : 0
            }
            style={{ flex: 1 }}
          />
        </div>
      </Col>

      <Col span={4}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <InputNumber
            min={-40}
            max={20}
            style={{
              width: 100,
              borderRadius: 4,
              border: "1px solid #d9d9d9",
              padding: "4px 0px",
              marginLeft: "20px",
              fontSize: 14,
            }}
            value={inputTemperatureValue}
            onChange={onChangeTemperature}
          />
        </div>
      </Col>

      <Col span={2}>
        <Typography.Text
          style={{
            fontSize: 16,
            color: "rgba(0, 0, 0, 0.85)",
            fontWeight: 500,
            marginLeft: 12,
          }}
        >
          °C
        </Typography.Text>
      </Col>
    </Row>
  );
};

const MoreAction: React.FC = () => {
  const [temperatureVisible, setTemperatureVisible] = useState(false);
  const [orderVisible, setOrderVisible] = useState(false);

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: "设备温度调控",
      onClick: () => setTemperatureVisible(true),
    },
    {
      key: "2",
      label: "设备绑定订单",
      onClick: () => setOrderVisible(true),
    },
  ];

  return (
    <>
      <Dropdown menu={{ items }} placement="topLeft">
        <Button type="link" size="small">
          更多
        </Button>
      </Dropdown>

      {/* 温度调控弹窗 */}
      <Modal
        title="设备温度调控"
        open={temperatureVisible}
        onOk={() => setTemperatureVisible(false)}
        onCancel={() => setTemperatureVisible(false)}
      >
        <TemperatureSetting />
      </Modal>

      {/* 订单绑定弹窗 */}
      <Modal
        title="设备绑定订单"
        open={orderVisible}
        onOk={() => setOrderVisible(false)}
        onCancel={() => setOrderVisible(false)}
      >
        <LeaseOrderSetting />
      </Modal>
    </>
  );
};

export default MoreAction;
