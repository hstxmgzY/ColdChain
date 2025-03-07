import React from "react"
import { Table, Tag, Popconfirm, message } from "antd"
import { ColdModuleType } from "../../interface/resource/coldModule.ts"
import { ReviewOrderType } from "../../interface/order/review.ts"

const confirm = (e?: React.MouseEvent<HTMLElement>) => {
    console.log(e)
    message.success("Click on Yes")
}

const cancel = (e?: React.MouseEvent<HTMLElement>) => {
    console.log(e)
    message.error("Click on No")
}

interface LeaseDetailTableProps {
    record: ReviewOrderType
}

const LeaseDetailTable: React.FC<LeaseDetailTableProps> = ({ record }) => {
    const columns = [
        {
            title: "拟分配冷链模块编号",
            dataIndex: "id",
            key: "id",
        },
        {
            title: "冷链模块开关",
            render: (_: unknown, record: ColdModuleType) => (
                <Popconfirm
                    title="关闭冷链模块"
                    description="你确定要关闭这个冷链模块吗?"
                    onConfirm={confirm}
                    onCancel={cancel}
                    okText="确定"
                    cancelText="取消"
                >
                    <Tag
                        color={record.isEnabled ? "green" : "red"}
                        className="cursor-pointer"
                    >
                        {record.isEnabled ? "开启" : "关闭"}
                    </Tag>
                </Popconfirm>
            ),
            key: "isEnabled",
        },
        {
            title: "产品名称",
            dataIndex: ["product", "productName"],
            key: "productName",
        },
        {
            title: "产品类别",
            render: (_: unknown, record: ColdModuleType) => (
                <Tag color="#87d068">{record.product?.category}</Tag>
            ),
            key: "category",
        },
        {
            title: "产品重量(kg)",
            dataIndex: ["product", "weight"],
            key: "weight",
        },
        {
            title: "产品体积(m³)",
            dataIndex: ["product", "volume"],
            key: "volume",
        },
        {
            title: "温度范围 (°C)",
            render: (_: unknown, record: ColdModuleType) =>
                `${record.minTemperature} ~ ${record.maxTemperature}`,
            key: "temperatureRange",
        },
        {
            title: "状态",
            render: (_: unknown, record: ColdModuleType) =>
                record.status === "待分配" ? (
                    <Tag color="blue">待分配</Tag>
                ) : (
                    <Tag color="green">已分配</Tag>
                ),
            dataIndex: "status",
            key: "status",
        },
    ]

    return (
        <Table
            columns={columns}
            dataSource={record.coldModules}
            rowKey="id"
            pagination={false}
        />
    )
}

export default LeaseDetailTable
