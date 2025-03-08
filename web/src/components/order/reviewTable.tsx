import React, { useState, useEffect } from "react"
import { Table, Button, Tag, message, Alert } from "antd"
import type { TableProps } from "antd"
import {
    getAuditList,
    approveOrder,
    rejectOrder,
} from "../../api/modules/order/review.ts"
import { ReviewOrderType } from "../../interface/order/review"
import { createStyles } from "antd-style"
import { ColdModuleType } from "../../interface/resource/coldModule.ts"
import LeaseDetailTable from "./leaseDetailTable.tsx"
import ReviewModal from "./reviewModal.tsx"

const useStyle = createStyles(({ css }) => ({
    urgentTag: css`
        background: #ff4d4f !important;
        color: white !important;
    `,
    licensePreview: css`
        cursor: pointer;
        border: 1px solid #ddd;
        &:hover {
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
    `,
}))

const ReviewTable: React.FC = () => {
    const [orders, setOrders] = useState<ReviewOrderType[]>([])
    const [selectedOrder, setSelectedOrder] = useState<ReviewOrderType | null>(
        null
    )
    const [rejectReason, setRejectReason] = useState("")
    const [modalType, setModalType] = useState<"approve" | "reject">("approve")
    const { styles } = useStyle()

    const handleSubmitAudit = async () => {
        if (!selectedOrder) return
        try {
            if (modalType === "approve") {
                await approveOrder(selectedOrder.order_number)
                message.success("订单已通过，正在分配资源...")
            } else {
                if (!rejectReason.trim()) {
                    message.warning("请输入驳回原因")
                    return
                }
                await rejectOrder(selectedOrder.order_number, rejectReason)
                message.warning("订单已驳回")
            }
            loadAuditOrders() // 刷新列表
            setSelectedOrder(null) // 关闭弹窗
            setRejectReason("") // 清空输入
        } catch {
            message.error("操作失败")
        }
    }

    // 减少 columns 内部的重复计算
    const getUniqueCategories = (modules: ColdModuleType[]) => {
        return [...new Set(modules.map((module) => module.product?.category))]
    }

    // 列定义 - 聚焦审核关键信息
    const columns: TableProps<ReviewOrderType>["columns"] = [
        {
            title: "紧急度",
            dataIndex: "priority",
            render: (val) =>
                val === "紧急" ? (
                    <Tag className={styles.urgentTag}>加急</Tag>
                ) : (
                    <Tag color="blue">标准</Tag>
                ),
        },
        {
            title: "订单编号",
            dataIndex: "order_number",
            ellipsis: true,
        },
        {
            title: "用户类型",
            dataIndex: "userType",
            render: (val) => (val === "merchant" ? "商户" : "个人"),
        },
        {
            title: "用户名称",
            dataIndex: "userType",
            render: (_, record) =>
                record.userType === "merchant"
                    ? record.companyName
                    : record.userName,
        },
        {
            title: "配送类型",
            dataIndex: "coldModules",
            render: (modules: ColdModuleType[]) => (
                <div className="flex flex-wrap gap-1">
                    {getUniqueCategories(modules).map((category, index) => (
                        <Tag color="#87d068" key={index}>
                            {category}
                        </Tag>
                    ))}
                </div>
            ),
        },
        {
            title: "操作",
            key: "action",
            render: (_, record) => (
                <div className="flex items-center gap-4">
                    <Button
                        type="primary"
                        onClick={() => handleOpenModal(record, "approve")}
                    >
                        通过
                    </Button>
                    <Button
                        danger
                        onClick={() => handleOpenModal(record, "reject")}
                    >
                        驳回
                    </Button>
                </div>
            ),
        },
    ]

    // 获取待审核订单列表
    const loadAuditOrders = async () => {
        try {
            const res = await getAuditList("pending")
            console.log(res)
            setOrders(res)
        } catch {
            message.error("加载审核订单失败")
        }
    }

    // 注意注意要改这个useEffect，他现在只会在挂载时执行

    useEffect(() => {
        loadAuditOrders() // 仅加载 `pending` 状态订单
    }, [])

    // 打开审核弹窗
    const handleOpenModal = (
        order: ReviewOrderType,
        type: "approve" | "reject"
    ) => {
        setSelectedOrder(order)
        setModalType(type)
        if (type === "reject") setRejectReason("") // 清空驳回原因
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            {/* 状态提示条 */}
            <Alert
                message="待审核订单需在30分钟内处理"
                type="info"
                showIcon
                className="mb-4"
            />

            {/* 订单表格 */}
            <Table
                columns={columns}
                expandable={{
                    expandedRowRender: (record) => (
                        <LeaseDetailTable record={record} />
                    ),
                    rowExpandable: (record) => record.coldModules?.length > 0,
                }}
                dataSource={orders}
                rowKey="id"
                pagination={{ pageSize: 8 }}
            />

            {/* 审核弹窗 */}
            <ReviewModal
                visible={!!selectedOrder}
                order={selectedOrder}
                type={modalType}
                rejectReason={rejectReason}
                onCancel={() => setSelectedOrder(null)}
                onReasonChange={setRejectReason}
                onSubmit={handleSubmitAudit}
            />
        </div>
    )
}

export default ReviewTable
