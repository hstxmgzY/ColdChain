import React from "react"
import { Button, Table, Tag, Typography, Space } from "antd"
import { ColumnsType } from "antd/es/table"
import { ColdModuleType } from "../../../interface/resource/coldModule"
import MoreAction from "./coldModuleDetail/MoreAction"

const { Text } = Typography

interface ColdModuleTableProps {
    data: ColdModuleType[]
}

const ColdModuleTable: React.FC<ColdModuleTableProps> = ({ data }) => {
    const columns: ColumnsType<ColdModuleType> = [
        {
            title: "模块ID",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "状态",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Tag color={status === "待分配" ? "blue" : "purple"}>
                    {status}
                </Tag>
            ),
        },
        {
            title: "当前温度 (℃)",
            dataIndex: "temperature",
            key: "temperature",
            render: (temp) => (
                <Text style={{ color: temp > 5 ? "#cf1322" : "inherit" }}>
                    {temp}℃
                </Text>
            ),
        },
        {
            title: "电量 (%)",
            dataIndex: "battery",
            key: "battery",
        },
        {
            title: "工作时间 (小时)",
            dataIndex: "workingTime",
            key: "workingTime",
        },
        {
            title: "启用状态",
            dataIndex: "isEnabled",
            key: "isEnabled",
            render: (isEnabled) => (
                <Tag color={isEnabled ? "green" : "red"}>
                    {isEnabled ? "在线" : "离线"}
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
    ]

    return <Table dataSource={data} columns={columns} rowKey="id" />
}

export default ColdModuleTable
