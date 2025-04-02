import React from "react"
import { Table, Tag, Popconfirm, message } from "antd"
import {
    OrderType,
    OrderItemType,
} from "../../interface/order/order"

const confirm = (e?: React.MouseEvent<HTMLElement>) => {
    console.log(e)
    message.success("Click on Yes")
}

const cancel = (e?: React.MouseEvent<HTMLElement>) => {
    console.log(e)
    message.error("Click on No")
}

interface LeaseDetailTableProps {
    record: OrderType
}

const LeaseDetailTable: React.FC<LeaseDetailTableProps> = ({ record }) => {
    console.log("当前记录:", record)
    console.log("订单项:", record.order_items)
    console.log("产品信息:", record.order_items?.[0]?.product)

    const columns = [
        {
            title: "拟分配冷链模块编号",
            render: (_: unknown, record: OrderItemType) => {
                return record.module?.[0]?.device_id || "-"
            },
            key: "moduleNumber",
        },
        {
            title: "冷链模块开关",
            render: (_: unknown, record: OrderItemType) => (
                <Popconfirm
                    title="关闭冷链模块"
                    description="你确定要关闭这个冷链模块吗?"
                    onConfirm={confirm}
                    onCancel={cancel}
                    okText="确定"
                    cancelText="取消"
                >
                    <Tag
                        color={record.module?.[0]?.isEnabled ? "green" : "red"}
                        className="cursor-pointer"
                    >
                        {record.module?.[0]?.isEnabled ? "开启" : "关闭"}
                    </Tag>
                </Popconfirm>
            ),
            key: "isEnabled",
        },
        {
            title: "产品名称",
            render: (_: unknown, record: OrderItemType) =>
                record.product?.product_name || "-",
            key: "productName",
        },
        {
            title: "产品类别",
            render: (_: unknown, record: OrderItemType) => (
                <Tag color="#87d068">
                    {record.product?.category_name || "未知"}
                </Tag>
            ),
            key: "category",
        },
        {
            title: "产品重量(kg)",
            render: (_: unknown, record: OrderItemType) =>
                record.product?.spec_weight || "-",
            key: "weight",
        },
        {
            title: "产品体积(m³)",
            render: (_: unknown, record: OrderItemType) =>
                record.product?.spec_volume || "-",
            key: "volume",
        },
        {
            title: "温度范围 (°C)",
            render: (_: unknown, record: OrderItemType) => {
                const product = record.product
                if (!product) return "-"
                return `${product.min_temperature} ~ ${product.max_temperature}`
            },
            key: "temperatureRange",
        },
        {
            title: "状态",
            render: (_: unknown, record: OrderItemType) => {
                const moduleStatusMap = {
                    assigned: <Tag color="blue">已分配</Tag>,
                    unassigned: <Tag color="green">未分配</Tag>,
                    faulty: <Tag color="red">故障</Tag>,
                }
                const status = record.module?.[0]?.status as
                    | keyof typeof moduleStatusMap
                    | undefined
                return status ? moduleStatusMap[status] : <Tag>未知状态</Tag>
            },
            key: "status",
        },
    ]

    return (
        <Table<OrderItemType>
            size="small"
            columns={columns}
            dataSource={record.order_items.map((item) => ({
                ...item,
                key: item.id,
            }))}
            rowKey="id"
            pagination={false}
        />
    )
}

export default LeaseDetailTable
