import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Button,
  Select,
  Space,
  Typography,
  Tabs,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import ColdModuleCard from "./coldModuleCard";
import ColdModuleTable from "./coldModuleTable";
import { ColdModuleType } from "../../../interface/resource/coldModule";
import {
  getModuleList,
  addModule,
} from "../../../api/modules/resources/module";
// 引入获取温度和电池电量数据的接口及类型
import {
  getTemperatureList,
  TemperatureData,
} from "../../../api/modules/monitor";

const { Text } = Typography;

const ColdModuleManager = () => {
  const [moduleData, setModuleData] = useState<ColdModuleType[]>([]);
  const [filteredData, setFilteredData] = useState<ColdModuleType[]>([]);
  const [viewMode, setViewMode] = useState<"card" | "table">("card");
  const [selectedTab, setSelectedTab] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchModuleData();
    connectWebSocket(); // 预留 websocket 连接
  }, []);

  const fetchModuleData = async () => {
    try {
      // 先获取模块列表
      const moduleResponse = await getModuleList();
      // 再获取温度和电池数据
      const temperatureResponse = await getTemperatureList();
      // 构建一个 map，以 device_id 为键方便后续匹配数据
      const temperatureMap: Map<string, TemperatureData> = new Map();
      temperatureResponse.forEach((temp) => {
        temperatureMap.set(temp.device_id, temp);
      });

      // 根据模块数据，结合温度数据更新 temperature 和 battery 字段
      const data = moduleResponse.map((item: any) => {
        const tempData = temperatureMap.get(item.device_id);
        return {
          id: item.id,
          device_id: item.device_id,
          // 如果温度数据存在，则使用接口返回的温度，否则保留原先配置温度
          temperature: tempData
            ? tempData.temperature
            : item.settingTemperature,
          status: item.status,
          is_enabled: item.is_enabled,
          // 对应电池数据字段 battery_level 赋值给 battery
          battery: tempData ? tempData.battery_level : undefined,
          volume: undefined,
          product: undefined,
        };
      });

      setModuleData(data);
      setFilteredData(data);
    } catch (error) {
      console.error("获取模块列表失败:", error);
    }
  };

  const connectWebSocket = () => {
    // WebSocket 预留逻辑
    // const socket = new WebSocket("ws://your-server/ws/module")
    // socket.onmessage = (event) => {
    //   const update = JSON.parse(event.data)
    //   // 根据 device_id 更新状态数据
    // }
  };

  const handleAddModule = async () => {
    try {
      const values = await form.validateFields();
      const response = await addModule({
        device_id: values.device_id,
      });

      if (response) {
        message.success("添加成功");
        fetchModuleData();
      }
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("添加模块失败:", error);
      message.error("添加失败，请检查设备编号是否重复");
    }
  };

  const handleTabChange = (key: string) => {
    const newTab = key === selectedTab ? null : key;
    setSelectedTab(newTab);

    let filtered = moduleData;
    if (newTab) {
      filtered = filtered.filter((item) => item.status === newTab);
    }
    setFilteredData(filtered);
  };

  const handleSearch = (key: string, value: any) => {
    let filtered = moduleData;

    if (key === "isEnabled" && value !== undefined) {
      filtered = filtered.filter((item) => item.is_enabled === value);
    }

    if (selectedTab) {
      filtered = filtered.filter((item) => item.status === selectedTab);
    }

    setFilteredData(filtered);
  };

  const tabsItems = [
    { key: "待分配", label: "待分配" },
    { key: "已分配", label: "已分配" },
  ];

  return (
    <div>
      <Row
        justify="start"
        align="middle"
        gutter={[16, 16]}
        style={{ marginBottom: 16 }}
      >
        <Col span={8}>
          <Button type="primary" onClick={() => setIsModalVisible(true)}>
            添加冷链模块
          </Button>
        </Col>
        <Col span={8}>
          <Space>
            <Text>启用状态：</Text>
            <Select
              placeholder="全部状态"
              onChange={(v) => handleSearch("isEnabled", v)}
              style={{ width: 250 }}
              allowClear
            >
              <Select.Option value={true}>在线</Select.Option>
              <Select.Option value={false}>离线</Select.Option>
            </Select>
          </Space>
        </Col>
        <Col span={8} style={{ textAlign: "right" }}>
          <Button
            onClick={() => setViewMode(viewMode === "card" ? "table" : "card")}
          >
            切换视图
          </Button>
        </Col>
      </Row>

      <Tabs
        activeKey={selectedTab || ""}
        items={tabsItems}
        onChange={handleTabChange}
      />

      {viewMode === "card" ? (
        <ColdModuleCard data={filteredData} />
      ) : (
        <ColdModuleTable data={filteredData} />
      )}

      <Modal
        title="添加冷链模块"
        open={isModalVisible}
        onOk={handleAddModule}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="device_id"
            label="设备编号"
            rules={[{ required: true, message: "请输入设备编号" }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ColdModuleManager;
