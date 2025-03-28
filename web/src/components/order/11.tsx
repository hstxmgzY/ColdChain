import React, { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
    Space,
    Table,
    Tag,
    Button,
    Row,
    Col,
    Input,
    Typography,
    Modal,
    Form,
    message,
    Select,
} from "antd"
import type { TableProps } from "antd"
import {
    fetchOrders,
    createNewOrder,
    updateExistingOrder,
    removeOrder,
    selectOrders,
    selectOrderLoading,
    selectOrderError,
} from "../../store/reducers/order"
import { AppDispatch } from "../../store"
import { LeaseType } from "../../interface/order/lease"

const { Search } = Input
const { Text } = Typography

const LeaseTable: React.FC = () => {
    const [modalVisible, setModalVisible] = useState(false)
    const [editingLease, setEditingLease] = useState<LeaseType | null>(null)
    const [form] = Form.useForm()
    const dispatch = useDispatch<AppDispatch>()
    const orders = useSelector(selectOrders)
    const orderLoading = useSelector(selectOrderLoading)
    const error = useSelector(selectOrderError)

    useEffect(() => {
        dispatch(fetchOrders())
    }, [dispatch])

    const handleDelete = async (id: number) => {
        await dispatch(removeOrder(id))
        message.success("订单已删除")
    }

    const handleEdit = (lease: LeaseType) => {
        setEditingLease(lease)
        setModalVisible(true)
        form.setFieldsValue(lease)
    }

    const handleSave = async () => {
        try {
            const values = await form.validateFields()
            if (editingLease) {
                await dispatch(
                    updateExistingOrder({
                        id: editingLease.id,
                        updatedData: values,
                    })
                )
            } else {
                await dispatch(createNewOrder(values))
            }
            message.success(editingLease ? "订单已更新" : "订单已创建")
            setModalVisible(false)
        } catch {
            message.error("操作失败，请重试")
        }
    }

    const columns: TableProps<LeaseType>["columns"] = [
        {
            title: "订单编号",
            dataIndex: "order_number",
            key: "order_number",
            fixed: "left",
        },
        {
            title: "状态",
            dataIndex: "status",
            key: "status",
            fixed: "left",
            render: (status) => {
                const statusColors: Record<string, string> = {
                    待支付: "volcano",
                    已支付: "green",
                    已审核: "blue",
                    已发货: "purple",
                    已完成: "gold",
                    已取消: "red",
                }
                return <Tag color={statusColors[status]}>{status}</Tag>
            },
        },
        { title: "价格", dataIndex: "price", key: "price" },
        { title: "下单时间", dataIndex: "create_time", key: "create_time" },
        {
            title: "操作",
            key: "action",
            fixed: "right",
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" onClick={() => handleEdit(record)}>
                        更新
                    </Button>
                    <Button
                        type="primary"
                        danger
                        onClick={() => handleDelete(record.id)}
                    >
                        删除
                    </Button>
                </Space>
            ),
        },
    ]

    if (orderLoading) return <p>加载中...</p>
    if (error) return <p>错误: {error}</p>

    return (
        <div>
            <Table<LeaseType>
                loading={orderLoading}
                rowKey="id"
                columns={columns}
                dataSource={orders}
                pagination={{ pageSize: 7 }}
            />
            <Modal
                title={editingLease ? "更新订单" : "创建订单"}
                open={modalVisible}
                onOk={handleSave}
                onCancel={() => setModalVisible(false)}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="status"
                        label="订单状态"
                        rules={[{ required: true, message: "请选择订单状态" }]}
                    >
                        <Select>
                            <Select.Option value="待支付">待支付</Select.Option>
                            <Select.Option value="已支付">已支付</Select.Option>
                            <Select.Option value="已审核">已审核</Select.Option>
                            <Select.Option value="已发货">已发货</Select.Option>
                            <Select.Option value="已完成">已完成</Select.Option>
                            <Select.Option value="已取消">已取消</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="order_note" label="订单备注">
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default LeaseTable
