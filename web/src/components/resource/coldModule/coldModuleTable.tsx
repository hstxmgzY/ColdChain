import React from "react";
import { Button, Table, Tag, Typography, Space } from "antd";
import { ColumnsType } from "antd/es/table";
import ModuleType from "../../../interface/resource/module";
import MoreAction from "./coldModuleDetail/MoreAction";

const { Text } = Typography;

interface ColdModuleTableProps {
  data: ModuleType[];
}

const ColdModuleTable: React.FC<ColdModuleTableProps> = ({ data }) => {
  const columns: ColumnsType<ModuleType> = [
    {
      title: "模块ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "物理设备ID",
      dataIndex: "device_id",
      key: "device_id",
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag
          color={
            status === "unassigned"
              ? "blue"
              : status === "assigned"
                ? "purple"
                : status === "faulty"
                  ? "red"
                  : "default"
          }
        >
          {status === "unassigned"
            ? "待分配"
            : status === "assigned"
              ? "已分配"
              : status === "faulty"
                ? "故障中"
                : status}
        </Tag>
      ),
    },
    {
      title: "当前温度 (℃)",
      dataIndex: "temperature",
      key: "temperature",
      render: (temp) => (
        <Text style={{ color: temp > 5 ? "#cf1322" : "inherit" }}>{temp}℃</Text>
      ),
    },
    {
      title: "电量 (%)",
      dataIndex: "battery",
      key: "battery",
    },
    {
      title: "启用状态",
      dataIndex: "is_enabled",
      key: "is_enabled",
      render: (is_enabled) => (
        <Tag color={is_enabled ? "green" : "red"}>
          {is_enabled ? "在线" : "离线"}
        </Tag>
      ),
    },
    {
      title: "操作",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => console.log("设备轨迹", record.id)}
          >
            设备轨迹
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => console.log("详情", record.id)}
          >
            详情
          </Button>
          <MoreAction />
        </Space>
      ),
    },
  ];

  return <Table dataSource={data} columns={columns} rowKey="id" />;
};

export default ColdModuleTable;
