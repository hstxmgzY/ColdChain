import React, { useEffect, useRef, useState } from "react"
import * as echarts from "echarts"
import { Descriptions, Table, Tag, Tabs } from "antd"
import type { DescriptionsProps, TableProps, TabsProps } from "antd"
// import ReactECharts from "echarts-for-react"
import { Splitter, Typography } from "antd"

// 组件1：设备信息展示
const DeviceInfoPanel = () => {
    const deviceInfoItems: DescriptionsProps["items"] = [
        {
            key: "1",
            label: "设备ID",
            children: "DEV-2024-00123",
        },
        {
            key: "2",
            label: "所属订单",
            children: "ORD20231234001",
        },
        {
            key: "3",
            label: "当前状态",
            children: <Tag color="green">运行中</Tag>,
        },
        {
            key: "4",
            label: "温度范围",
            children: "-20°C ~ 5°C",
        },
        {
            key: "5",
            label: "最后更新时间",
            children: "2024-03-15 14:30:45",
        },
    ]

    return (
        <div style={{ padding: 16 }}>
            <Descriptions
                title="设备详细信息"
                column={1}
                items={deviceInfoItems}
            />
        </div>
    )
}

// 组件2：故障列表
const FaultTable = () => {
    interface FaultRecord {
        key: string
        orderNo: string
        alertTime: string
        reason: string
        status: "pending" | "resolved"
    }

    const columns: TableProps<FaultRecord>["columns"] = [
        {
            title: "订单编号",
            dataIndex: "orderNo",
            key: "orderNo",
        },
        {
            title: "预警时间",
            dataIndex: "alertTime",
            key: "alertTime",
        },
        {
            title: "预警原因",
            dataIndex: "reason",
            key: "reason",
        },
        {
            title: "处理情况",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === "pending" ? "red" : "green"}>
                    {status === "pending" ? "未处理" : "已处理"}
                </Tag>
            ),
        },
    ]

    const data: FaultRecord[] = [
        {
            key: "1",
            orderNo: "ORD20231234001",
            alertTime: "2024-03-15 10:23:12",
            reason: "温度超限",
            status: "pending",
        },
        {
            key: "2",
            orderNo: "ORD20231234002",
            alertTime: "2024-03-14 15:45:32",
            reason: "设备离线",
            status: "resolved",
        },
    ]

    return (
        <div style={{ padding: "0 16px" }}>
            <Table
                columns={columns}
                dataSource={data}
                pagination={false}
                size="small"
                title={() => (
                    <Typography.Title level={5}>设备预警记录</Typography.Title>
                )}
            />
        </div>
    )
}

// 组件3：温度曲线图表
const TemperatureChart = () => {
    const [timeRange, setTimeRange] = useState<"day" | "week" | "month">("day")
    const chartRef = useRef<HTMLDivElement>(null)
    const chartInstance = useRef<echarts.ECharts>()

    // 生成模拟数据
    const generateChartData = () => {
        const data = []
        const baseDate = new Date()
        const pointCount =
            timeRange === "day" ? 24 : timeRange === "week" ? 7 : 30

        for (let i = 0; i < pointCount; i++) {
            data.push({
                time:
                    timeRange === "day"
                        ? `${i}:00`
                        : timeRange === "week"
                          ? `周${i + 1}`
                          : `${i + 1}日`,
                value: Math.floor(Math.random() * 20) - 10,
            })
        }
        return data
    }

    // 初始化图表
    const initChart = () => {
        if (!chartRef.current) return

        // 销毁旧实例
        if (chartInstance.current) {
            chartInstance.current.dispose()
        }

        // 创建新实例
        chartInstance.current = echarts.init(chartRef.current)

        const option = {
            tooltip: {
                trigger: "axis",
            },
            xAxis: {
                type: "category",
                data: generateChartData().map((item) => item.time),
            },
            yAxis: {
                type: "value",
                name: "温度 (°C)",
            },
            series: [
                {
                    data: generateChartData().map((item) => item.value),
                    type: "line",
                    smooth: true,
                    lineStyle: {
                        color: "#1890ff",
                    },
                    areaStyle: {
                        color: "#e6f7ff",
                    },
                },
            ],
        }

        chartInstance.current.setOption(option)
    }

    // 处理窗口大小变化
    const handleResize = () => {
        chartInstance.current?.resize()
    }

    useEffect(() => {
        initChart()
        window.addEventListener("resize", handleResize)

        return () => {
            window.removeEventListener("resize", handleResize)
            chartInstance.current?.dispose()
        }
    }, [])

    // 时间范围变化时更新图表
    useEffect(() => {
        initChart()
    }, [timeRange])

    const timeRangeItems = [
        { key: "day", label: "当日" },
        { key: "week", label: "本周" },
        { key: "month", label: "当月" },
    ]

    return (
        <div style={{ padding: 16 }}>
            <Tabs
                activeKey={timeRange}
                onChange={(key) => setTimeRange(key as any)}
                items={timeRangeItems}
            />
            <div
                ref={chartRef}
                style={{
                    height: 400,
                    width: "100%",
                }}
            />
        </div>
    )
}

// 主布局组件
const DetailInfo: React.FC = () => (
    <Splitter
        lazy
        style={{
            height: "80vh",
            boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
            background: "#fff",
        }}
    >
        <Splitter.Panel defaultSize="30%" min="25%" max="35%" collapsible>
            <DeviceInfoPanel />
        </Splitter.Panel>
        <Splitter.Panel>
            <Splitter layout="vertical">
                <Splitter.Panel collapsible>
                    <FaultTable />
                </Splitter.Panel>
                <Splitter.Panel collapsible>
                    <TemperatureChart />
                </Splitter.Panel>
            </Splitter>
        </Splitter.Panel>
    </Splitter>
)

export default DetailInfo
