import React, { useState, useEffect } from "react"
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
    selectOrders,
    selectOrderLoading,
    selectOrderError,
} from "../../store/reducers/order"
import { AppDispatch } from "../../store"

import { createStyles } from "antd-style"
import { LeaseType } from "../../interface/order/lease"

const useStyle = createStyles(({ css }) => ({
    customTable: css`
        .ant-table {
            .ant-table-container {
                .ant-table-body,
                .ant-table-content {
                    scrollbar-width: thin;
                    scrollbar-color: #eaeaea transparent;
                }
            }
        }
    `,
}))

const { Search } = Input
const { Text } = Typography

const LeaseTable: React.FC = () => {
    const [data, setData] = useState<LeaseType[]>([])
    const [filteredData, setFilteredData] = useState<LeaseType[]>([])
    const [modalVisible, setModalVisible] = useState(false)
    const [editingLease, setEditingLease] = useState<LeaseType | null>(null)
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [searchParams, setSearchParams] = useState({
        orderNumber: "",
        status: "",
        senderName: "",
        senderPhone: "",
        senderAddress: "",
        receiverName: "",
        receiverPhone: "",
        receiverAddress: "",
    })
    const { styles } = useStyle()
    const dispatch = useDispatch<AppDispatch>()
    const orders = useSelector(selectOrders)
    const orderLoading = useSelector(selectOrderLoading)
    const error = useSelector(selectOrderError)

    useEffect(() => {
        dispatch(fetchOrders())
    }, [dispatch])

    useEffect(() => {
        if (modalVisible && editingLease) {
            form.setFieldsValue(editingLease)
        } else if (modalVisible) {
            form.resetFields()
        }
    }, [modalVisible, editingLease, form])

    useEffect(() => {
        if (!data) return // 防止 data 为空时报错

        setFilteredData(
            data.filter((item) => {
                return (
                    (!searchParams.orderNumber ||
                        item.order_number.includes(searchParams.orderNumber)) &&
                    (!searchParams.status ||
                        item.status === searchParams.status) &&
                    (!searchParams.senderName ||
                        item.sender_name.includes(searchParams.senderName)) &&
                    (!searchParams.senderPhone ||
                        item.sender_phone.includes(searchParams.senderPhone)) &&
                    (!searchParams.senderAddress ||
                        item.sender_address.includes(
                            searchParams.senderAddress
                        )) &&
                    (!searchParams.receiverName ||
                        item.receiver_name.includes(
                            searchParams.receiverName
                        )) &&
                    (!searchParams.receiverPhone ||
                        item.receiver_phone.includes(
                            searchParams.receiverPhone
                        )) &&
                    (!searchParams.receiverAddress ||
                        item.receiver_address.includes(
                            searchParams.receiverAddress
                        ))
                )
            })
        )
    }, [data, searchParams])


    if (orderLoading) return <p>加载中...</p>
    if (error) return <p>错误: {error}</p>

    // 所有搜索处理函数
    const handleSearch = (field: keyof typeof searchParams, value: string) => {
        setSearchParams((prev) => ({
            ...prev,
            [field]: value ? value.trim() : "",
        }))
    }

    // const fetchLeases = async () => {
    //     setLoading(true)
    //     try {
    //         const response = await getLeaseList()
    //         setData(response)
    //         setFilteredData(response)
    //     } catch {
    //         message.error("获取订单列表失败")
    //     } finally {
    //         setLoading(false)
    //     }
    // }

    // useEffect(() => {
    //     fetchLeases()
    // }, [])

    const handleDelete = async (id: number) => {
        try {
            await deleteLease(id)
            message.success("订单已删除")
            fetchLeases()
        } catch {
            message.error("删除失败，请重试")
        }
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
                await updateLease(editingLease.id, values)
            }
            message.success("订单信息已更新")
            fetchLeases()
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
            filters: Object.entries({
                待支付: "volcano",
                已支付: "green",
                已审核: "blue",
                已发货: "purple",
                已完成: "gold",
                已取消: "red",
            }).map(([status]) => ({
                text: status,
                value: status,
            })),
            onFilter: (value, record) => record.status === value,
        },
        { title: "价格", dataIndex: "price", key: "price" },
        { title: "下单时间", dataIndex: "create_time", key: "create_time" },
        { title: "取货时间", dataIndex: "delivery_time", key: "delivery_time" },
        {
            title: "发件人地址",
            dataIndex: "sender_address",
            key: "sender_address",
        },
        { title: "发件人姓名", dataIndex: "sender_name", key: "sender_name" },
        { title: "发件人电话", dataIndex: "sender_phone", key: "sender_phone" },
        {
            title: "收件人地址",
            dataIndex: "receiver_address",
            key: "receiver_address",
        },
        {
            title: "收件人姓名",
            dataIndex: "receiver_name",
            key: "receiver_name",
        },
        {
            title: "收件人电话",
            dataIndex: "receiver_phone",
            key: "receiver_phone",
        },
        {
            title: "操作",
            key: "action",
            fixed: "right",
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        onClick={() => handleEdit(record as LeaseType)}
                    >
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

    

    // // 修改状态筛选逻辑
    // const handleStatusFilter = () => {
    //     const newStatus = searchParams.status === "已支付" ? "" : "已支付"
    //     setSearchParams((prev) => ({
    //         ...prev,
    //         status: newStatus,
    //     }))
    // }

    return (
        <div>
            <Row
                justify="space-between"
                align="middle"
                gutter={[16, 16]}
                style={{ marginBottom: 16 }}
            >
                <Col span={8}>
                    <Space>
                        <Text>发件人姓名：</Text>
                        <Search
                            placeholder="输入发件人姓名"
                            onSearch={(v) => handleSearch("senderName", v)}
                            style={{ width: 250 }}
                        />
                    </Space>
                </Col>
                <Col span={8}>
                    <Space>
                        <Text>发件人电话：</Text>
                        <Search
                            placeholder="输入发件人电话"
                            onSearch={(v) => handleSearch("senderPhone", v)}
                            style={{ width: 250 }}
                        />
                    </Space>
                </Col>
                <Col span={8}>
                    <Space>
                        <Text>发件人地址：</Text>
                        <Search
                            placeholder="输入发件人地址"
                            onSearch={(v) => handleSearch("senderAddress", v)}
                            style={{ width: 250 }}
                        />
                    </Space>
                </Col>
            </Row>
            <Row
                justify="space-between"
                align="middle"
                gutter={[16, 16]}
                style={{ marginBottom: 16 }}
            >
                <Col span={8}>
                    <Space>
                        <Text>收件人姓名：</Text>
                        <Search
                            placeholder="输入收件人姓名"
                            onSearch={(v) => handleSearch("receiverName", v)}
                            style={{ width: 250 }}
                        />
                    </Space>
                </Col>
                <Col span={8}>
                    <Space>
                        <Text>收件人电话：</Text>
                        <Search
                            placeholder="输入收件人电话"
                            onSearch={(v) => handleSearch("receiverPhone", v)}
                            style={{ width: 250 }}
                        />
                    </Space>
                </Col>
                <Col span={8}>
                    <Space>
                        <Text>收件人地址：</Text>
                        <Search
                            placeholder="输入收件人地址"
                            onSearch={(v) => handleSearch("receiverAddress", v)}
                            style={{ width: 250 }}
                        />
                    </Space>
                </Col>
            </Row>
            <Row
                justify="space-between"
                align="middle"
                gutter={[16, 16]}
                style={{ marginBottom: 16 }}
            >
                <Col span={8}>
                    <Space>
                        {/* <Button
                            type="primary"
                            ghost
                            onClick={() => handleStatusFilter()}
                            style={{
                                backgroundColor: "#fff",
                                borderColor: "volcano",
                                color: "volcano",
                            }}
                        >
                            待审核（已支付订单）
                        </Button> */}
                    </Space>
                </Col>
                <Col span={8}>
                    <Space>
                        <Text>订单&nbsp;&nbsp;&nbsp;&nbsp;编号：</Text>
                        <Search
                            placeholder="输入订单编号"
                            onSearch={(v) => handleSearch("orderNumber", v)}
                            style={{ width: 250 }}
                        />
                    </Space>
                </Col>
                <Col span={8}>
                    <Space>
                        <Text>订单&nbsp;&nbsp;&nbsp;&nbsp;状态：</Text>
                        <Select
                            placeholder="全部状态"
                            onChange={(v) => handleSearch("status", v)}
                            style={{ width: 250 }}
                            allowClear
                        >
                            <Select.Option value="待支付">待支付</Select.Option>
                            <Select.Option value="已支付">已支付</Select.Option>
                            <Select.Option value="已审核">已审核</Select.Option>
                            <Select.Option value="已发货">已发货</Select.Option>
                            <Select.Option value="已完成">已完成</Select.Option>
                            <Select.Option value="已取消">已取消</Select.Option>
                        </Select>
                    </Space>
                </Col>
            </Row>
            <Table<LeaseType>
                className={styles.customTable}
                scroll={{ x: "max-content" }}
                loading={loading}
                size="middle"
                rowKey="id"
                columns={columns}
                dataSource={filteredData}
                pagination={{ pageSize: 7 }}
            />
            <Modal
                title="更新订单"
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
