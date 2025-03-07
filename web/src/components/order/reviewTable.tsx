import React, { useState, useEffect } from "react"
import {
    Table,
    Button,
    Tag,
    Modal,
    Descriptions,
    Form,
    Input,
    message,
    Alert,
    Popconfirm,
} from "antd"
import type { TableProps, PopconfirmProps } from "antd"
import {
    getAuditList,
    approveOrder,
    rejectOrder,
} from "../../api/modules/order/review.ts"
import { ReviewOrderType } from "../../interface/order/review"
import { createStyles } from "antd-style"
import { ColdModuleType } from "../../interface/resource/coldModule.ts"

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

    const confirm: PopconfirmProps["onConfirm"] = (e) => {
        console.log(e)
        message.success("Click on Yes")
    }

    const cancel: PopconfirmProps["onCancel"] = (e) => {
        console.log(e)
        message.error("Click on No")
    }

    const expandedRowRender = (record: ReviewOrderType) => {
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
                            onClick={() => {}}
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
                    {[
                        ...new Set(
                            modules.map((module) => module.product?.category)
                        ),
                    ].map((category, index) => (
                        <Tag key={index} color="#87d068">
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

    useEffect(() => {
        loadAuditOrders() // 仅加载 `pending` 状态订单
    }, [])

    // 处理审核操作
    const handleAudit = async () => {
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
            loadAuditOrders()
            setSelectedOrder(null)
        } catch {
            message.error("操作失败")
        }
    }

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
                    expandedRowRender,
                    rowExpandable: (record) => record.coldModules?.length > 0,
                }}
                dataSource={orders}
                rowKey="id"
                pagination={{ pageSize: 8 }}
            />

            {/* 审核弹窗 */}
            <Modal
                title={`订单审核 - ${selectedOrder?.order_number}`}
                open={!!selectedOrder}
                onCancel={() => setSelectedOrder(null)}
                footer={[
                    <Button key="cancel" onClick={() => setSelectedOrder(null)}>
                        关闭
                    </Button>,
                    <Button
                        key="submit"
                        type={modalType === "approve" ? "primary" : "default"}
                        danger={modalType === "reject"}
                        onClick={handleAudit}
                    >
                        {modalType === "approve" ? "确认通过" : "提交驳回"}
                    </Button>,
                ]}
                width={800}
            >
                {selectedOrder && (
                    <div className="space-y-4">
                        {/* 用户资质区块 */}
                        <Descriptions bordered size="small">
                            <Descriptions.Item label="用户身份" span={3}>
                                {selectedOrder.userType === "merchant" ? (
                                    <>
                                        <div>
                                            企业名称：
                                            {selectedOrder.companyName}
                                        </div>
                                        {/* <div className="mt-2">
                                            <span className="mr-2">
                                                营业执照：
                                            </span>
                                            <Image
                                                width={120}
                                                src={selectedOrder.licenseUrl}
                                                className={
                                                    styles.licensePreview
                                                }
                                                preview={{
                                                    src: selectedOrder.licenseUrl,
                                                }}
                                            />
                                        </div> */}
                                    </>
                                ) : (
                                    `个人用户（${selectedOrder.userName}）`
                                )}
                            </Descriptions.Item>
                        </Descriptions>

                        {/* 订单详情区块 */}
                        <Descriptions bordered>
                            <Descriptions.Item label="配送路线" span={2}>
                                {selectedOrder.route.join(" → ")}
                            </Descriptions.Item>
                            {/* <Descriptions.Item label="温控要求">
                                <Tag color="#87d068">
                                    {selectedOrder.temperatureRange}
                                </Tag>
                            </Descriptions.Item>
                            <Descriptions.Item label="产品类型" span={3}>
                                {selectedOrder.}（
                                {selectedOrder.productWeight}kg）
                            </Descriptions.Item> */}
                        </Descriptions>

                        {/* 驳回原因输入 */}
                        {modalType === "reject" && (
                            <Form.Item label="驳回原因" required>
                                <Input.TextArea
                                    rows={3}
                                    value={rejectReason}
                                    onChange={(e) =>
                                        setRejectReason(e.target.value)
                                    }
                                    placeholder="请输入详细驳回理由（至少15字）"
                                    showCount
                                    maxLength={200}
                                />
                            </Form.Item>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    )
}

export default ReviewTable
