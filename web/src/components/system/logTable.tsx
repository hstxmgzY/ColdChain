import React, { useEffect, useState } from "react";
import { Table, Tag, Typography, Row, Col, Space, Input } from "antd";
import type { ColumnsType } from "antd/es/table";

interface LogType {
  id: number;
  user: string;
  action: string;
  status: "success" | "fail";
  timestamp: string;
}

const { Search } = Input;
const { Text } = Typography;

const LogTable: React.FC = () => {
  const [logs, setLogs] = useState<LogType[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogType[]>([]);

  useEffect(() => {
    const mockLogs: LogType[] = [
      {
        id: 1,
        user: "姚婉欣",
        action: "添加车辆浙BC1BSB",
        status: "success",
        timestamp: "2025-05-01 13:22:01",
      },
      {
        id: 2,
        user: "姚婉欣",
        action: "添加车辆浙BC2BSB",
        status: "success",
        timestamp: "2025-05-01 13:23:42",
      },
      {
        id: 3,
        user: "姚婉欣",
        action: "添加车辆浙BC3BSB",
        status: "success",
        timestamp: "2025-05-01 13:24:51",
      },
      {
        id: 4,
        user: "姚婉欣",
        action: "添加车辆浙BC4BSB",
        status: "success",
        timestamp: "2025-05-01 13:25:23",
      },
      {
        id: 5,
        user: "姚婉欣",
        action: "添加车辆浙BC6BSB",
        status: "success",
        timestamp: "2025-05-01 13:26:12",
      },
      {
        id: 6,
        user: "姚婉欣",
        action: "添加车辆浙BC5BSB",
        status: "success",
        timestamp: "2025-05-01 13:27:12",
      },
      {
        id: 7,
        user: "姚婉欣",
        action: "登录系统",
        status: "success",
        timestamp: "2025-05-01 13:10:12",
      },
    ];
    setLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, []);

  const handleSearch = (value: string) => {
    if (!value.trim()) return setFilteredLogs(logs);
    setFilteredLogs(
      logs.filter(
        (log) => log.user.includes(value) || log.action.includes(value)
      )
    );
  };

  const columns: ColumnsType<LogType> = [
    { title: "用户", dataIndex: "user", key: "user" },
    { title: "行为", dataIndex: "action", key: "action" },
    {
      title: "状态",
      dataIndex: "status",
      render: (status) => (
        <Tag color={status === "success" ? "green" : "red"}>
          {status === "success" ? "成功" : "失败"}
        </Tag>
      ),
    },
    { title: "时间", dataIndex: "timestamp", key: "timestamp" },
  ];

  return (
    <div>
      <Row justify="space-between" style={{ marginBottom: 16 }}>
        <Col>
          <Text strong>系统日志</Text>
        </Col>
        <Col>
          <Space>
            <Text>搜索日志：</Text>
            <Search
              placeholder="输入用户或行为"
              onSearch={handleSearch}
              style={{ width: 240 }}
            />
          </Space>
        </Col>
      </Row>
      <Table rowKey="id" columns={columns} dataSource={filteredLogs} />
    </div>
  );
};

export default LogTable;
