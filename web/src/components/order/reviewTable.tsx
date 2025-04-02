import React, { useState, useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Table, Button, Tag, message, Alert, Spin, Empty } from "antd"
import type { TableProps } from "antd"
import {
    fetchOrders,
    selectOrders,
    selectOrderLoading,
    selectOrderError,
} from "../../store/reducers/order"
import { approveOrder, rejectOrder } from "../../api/modules/order/review.ts"
import { AppDispatch } from "../../store"
import { OrderType } from "../../interface/order/order"
import ReviewModal from "./reviewModal.tsx"

const ReviewTable: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()
    const orders = useSelector(selectOrders)
    const orderLoading = useSelector(selectOrderLoading)
    const error = useSelector(selectOrderError)

    useEffect(() => {
        dispatch(fetchOrders())
    }, [dispatch])
    const [selectedOrder, setSelectedOrder] = useState<OrderType | null>(null)
    const [rejectReason, setRejectReason] = useState("")
    const [modalType, setModalType] = useState<"approve" | "reject">("approve")

    const handleSubmitAudit = async () => {
        if (!selectedOrder) return
        try {
            if (modalType === "approve") {
                await approveOrder(selectedOrder.id)
                message.success("订单已通过，正在分配资源...")
            } else {
                if (!rejectReason.trim()) {
                    message.warning("请输入驳回原因")
                    return
                }
                await rejectOrder(selectedOrder.id, rejectReason)
                message.warning("订单已驳回")
            }
            dispatch(fetchOrders())
            setSelectedOrder(null)
            setRejectReason("")
        } catch {
            message.error("操作失败")
        }
    }

    // 列定义 - 聚焦审核关键信息
    const columns: TableProps<OrderType>["columns"] = [
        {
            title: "订单编号",
            dataIndex: "order_number",
            ellipsis: true,
        },
        {
            title: "订单状态",
            dataIndex: "status_name",
            render: (val) => {
                const color = val === "已支付" ? "orange" : "green"
                return <Tag color={color}>{val}</Tag>
            },
        },
        {
            title: "用户类型",
            dataIndex: "user_type",
            render: (_, record) => {
                const roleColors: Record<string, string> = {
                    individual: "purple",
                    merchant: "blue",
                    admin: "red",
                    manager: "green",
                }
                const color = roleColors[record.user.role_name] || "default"
                return <Tag color={color}>{record.user.role_name}</Tag>
            },
        },
        {
            title: "用户名称",
            dataIndex: "username",
            render: (_, record) => record.user.username,
        },
        {
            title: "租用冷链箱个数",
            dataIndex: "quantity",
            render: (_, record) => {
                const totalQuantity = (record.order_items || []).reduce(
                    // 空值保护
                    (sum, item) => sum + item.quantity,
                    0
                )
                return <span>{totalQuantity}</span>
            },
        },
        {
            title: "配送时间",
        },
        {
            title: "配送类型",
            dataIndex: "coldModules",
            render: (_, record) => (
                <div>
                    {(record.order_items || []) // 空值保护
                        .map((item) => (
                            <Tag key={item.product.category_name} color="blue">
                                {item.product.category_name}
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
    // const loadAuditOrders = async () => {
    //     try {
    //         const res = await getAuditList("pending")
    //         console.log(res)
    //         setOrders(res)
    //     } catch {
    //         message.error("加载审核订单失败")
    //     }
    // }

    // 注意注意要改这个useEffect，他现在只会在挂载时执行

    // useEffect(() => {
    //     loadAuditOrders() // 仅加载 `pending` 状态订单
    // }, [])

    // 打开审核弹窗
    const handleOpenModal = (order: OrderType, type: "approve" | "reject") => {
        setSelectedOrder(order)
        setModalType(type)
        if (type === "reject") setRejectReason("") // 清空驳回原因
    }

    if (orderLoading)
        return (
            <div className="flex justify-center mt-8">
                <Spin tip="订单加载中..." size="small" className="mt-4">
                    <div className="content py-4" />
                </Spin>
            </div>
        )

    if (error)
        return (
            <Empty
                className="mt-8"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                    <span className="text-red-500">数据加载失败: {error}</span>
                }
            />
        )

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
                dataSource={orders.filter(
                    (order) => order.status_name === "已支付"
                )}
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
