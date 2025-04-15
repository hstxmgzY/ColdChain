import React, { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { Descriptions, Table, Tag, Tabs, Button, Modal } from "antd";
import type { DescriptionsProps, TableProps } from "antd";
import { Splitter, Typography } from "antd";
import type ModuleType from "../../../../interface/resource/module";
import type { AlarmInfoType } from "../../../../interface/alarmInfo";
import { getMonitorAlarm } from "../../../../api/modules/monitor";

const { Title } = Typography;

/** 组件1：设备信息展示（无 Card 包裹） **/
interface DeviceInfoPanelProps {
  device: ModuleType;
}

const DeviceInfoPanel: React.FC<DeviceInfoPanelProps> = ({ device }) => {
  const items: DescriptionsProps["items"] = [
    { key: "1", label: "设备ID", children: device.device_id },
    {
      key: "2",
      label: "所属订单",
      children: device.orderNo || "ORD-1744612084791919000",
    },
    {
      key: "3",
      label: "当前状态",
      children: (
        <Tag
          color={
            device.status === "assigned"
              ? "green"
              : device.status === "unassigned"
                ? "red"
                : "default"
          }
        >
          {device.status === "assigned"
            ? "已分配"
            : device.status === "unassigned"
              ? "未分配"
              : device.status}
        </Tag>
      ),
    },
    {
      key: "4",
      label: "温度范围",
      children: device.temperatureRange || "-4～6",
    },
    {
      key: "5",
      label: "最后更新时间",
      children: device.lastUpdate || "2025-4-14",
    },
    {
      key: "6",
      label: "设备情况",
      children: (
        <Tag color={device.is_enabled ? "green" : "red"}>
          {device.is_enabled ? "在线" : "离线"}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: 16 }}>
      <Descriptions title="设备详细信息" column={1} items={items} />
    </div>
  );
};

interface FaultTableProps {
  faultRecords: AlarmInfoType[];
  loading: boolean;
}

const FaultTable: React.FC<FaultTableProps> = ({ faultRecords, loading }) => {
  const columns: TableProps<AlarmInfoType>["columns"] = [
    {
      title: "设备ID",
      dataIndex: "device_id", // 修改为 device_id
      key: "device_id",
    },
    {
      title: "报警时间",
      dataIndex: "timestamp",
      key: "timestamp",
      render: (time) => new Date(time).toLocaleString(),
    },
    {
      title: "报警级别",
      dataIndex: "alarm_level",
      key: "alarm_level",
      render: (level) => {
        const levelColors: Record<string, string> = {
          HIGH: "red",
          MEDIUM: "orange",
          LOW: "blue",
        };
        return <Tag color={levelColors[level] || "blue"}>{level}</Tag>;
      },
    },
    {
      title: "报警描述",
      dataIndex: "alarm_description",
      key: "alarm_description",
      ellipsis: true,
      render: (desc) => <span title={desc}>{desc}</span>,
    },
    {
      title: "处理状态",
      dataIndex: "alarm_status",
      key: "alarm_status",
      render: (status) => {
        const statusColors: Record<string, string> = {
          未读: "red",
          已读: "green",
          暂不处理: "gray",
        };
        return <Tag color={statusColors[status] || "gray"}>{status}</Tag>;
      },
    },
    {
      title: "备注",
      dataIndex: "remark",
      key: "remark",
      ellipsis: true,
    },
  ];

  return (
    <div style={{ padding: "0 16px" }}>
      <Table
        columns={columns}
        // 只显示最近 20 条记录
        dataSource={faultRecords.slice(-20).map((record) => ({
          ...record,
          key: record.id,
        }))}
        pagination={false}
        size="small"
        loading={loading}
      />
    </div>
  );
};

/** 组件3：温度曲线图表（通过 WebSocket 实时更新） **/
interface TemperatureChartProps {
  deviceId: string;
}

const TemperatureChart: React.FC<TemperatureChartProps> = ({ deviceId }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstance = useRef<echarts.ECharts | null>(null);
  const [chartData, setChartData] = useState<{ time: string; value: number }[]>(
    []
  );

  // 初始化 ECharts 实例
  useEffect(() => {
    if (chartRef.current) {
      chartInstance.current = echarts.init(chartRef.current);
    }
    return () => {
      chartInstance.current?.dispose();
    };
  }, []);

  // 通过 WebSocket 接收实时温度数据
  useEffect(() => {
    let ws: WebSocket;
    if (deviceId) {
      ws = new WebSocket(
        `ws://localhost:9998/ws/monitor/temperature/${deviceId}`
      );
      ws.onmessage = (event) => {
        const temperature = Number(event.data);
        setChartData((prevData) => {
          const newData = [
            ...prevData,
            { time: new Date().toLocaleTimeString(), value: temperature },
          ];
          if (newData.length > 50) newData.shift();
          return newData;
        });
      };
      ws.onerror = (error) => {
        console.error("WebSocket 错误", error);
      };
    }
    return () => {
      ws?.close();
    };
  }, [deviceId]);

  // 每次 chartData 更新时更新图表
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.setOption({
        tooltip: { trigger: "axis" },
        xAxis: {
          type: "category",
          data: chartData.map((item) => item.time),
        },
        yAxis: { type: "value", name: "温度 (°C)" },
        series: [
          {
            data: chartData.map((item) => item.value),
            type: "line",
            smooth: true,
            lineStyle: { color: "#1890ff" },
            areaStyle: { color: "#e6f7ff" },
          },
        ],
      });
    }
  }, [chartData]);

  return (
    <div style={{ padding: 16 }}>
      <Title level={5}>设备温度记录</Title>
      <div ref={chartRef} style={{ height: 400, width: "100%" }} />
    </div>
  );
};

/** 父组件：DetailInfo，通过传入设备数据获取故障记录等信息 **/
const DetailInfo: React.FC<{ device: ModuleType }> = ({ device }) => {
  const [faultRecords, setFaultRecords] = useState<AlarmInfoType[]>([]);
  const [loadingFaults, setLoadingFaults] = useState(false);
  const [visible, setVisible] = useState(false);

  // 从报警 API 获取该设备的报警记录
  const fetchFaultRecords = async () => {
    setLoadingFaults(true);
    try {
      const records = await getMonitorAlarm(device.device_id);
      // 修改过滤条件，使用 device_id 字段
      const filtered = records.filter(
        (rec) => rec.device_id === device.device_id
      );
      setFaultRecords(filtered);
    } catch (error) {
      console.error("获取报警记录失败", error);
    } finally {
      setLoadingFaults(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchFaultRecords();
    }
  }, [visible, device.device_id]);

  // 这里 DetailInfoSplitter 使用 Splitter 布局组合三个组件
  const DetailInfoSplitter: React.FC = () => (
    <Splitter
      lazy
      style={{
        height: "100%",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        background: "#fff",
      }}
    >
      <Splitter.Panel defaultSize="30%" min="25%" max="35%" collapsible>
        <DeviceInfoPanel device={device} />
      </Splitter.Panel>
      <Splitter.Panel>
        <Splitter layout="vertical">
          <Splitter.Panel collapsible>
            <FaultTable faultRecords={faultRecords} loading={loadingFaults} />
          </Splitter.Panel>
          <Splitter.Panel collapsible defaultSize="60%">
            <TemperatureChart deviceId={device.device_id} />
          </Splitter.Panel>
        </Splitter>
      </Splitter.Panel>
    </Splitter>
  );

  return (
    <>
      <Button type="link" size="small" onClick={() => setVisible(true)}>
        详情
      </Button>
      <Modal
        title="设备温度调控"
        open={visible}
        onOk={() => setVisible(false)}
        onCancel={() => setVisible(false)}
        width="90vw"
        bodyStyle={{ height: "80vh", overflowY: "auto" }}
        style={{ top: 30, left: 80 }}
      >
        <DetailInfoSplitter />
      </Modal>
    </>
  );
};

export default DetailInfo;
