import React, { useState, useEffect } from "react";
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
    Select
} from "antd";
import type { TableProps } from "antd";
import { getLeaseList, updateLease, deleteLease } from "../../api/modules/order/lease";

const { Search } = Input;
const { Text } = Typography;

const LeaseTable: React.FC = () => {
    const [data, setData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingLease, setEditingLease] = useState(null);
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (modalVisible && editingLease) {
            form.setFieldsValue(editingLease);
        } else if (modalVisible) {
            form.resetFields();
        }
    }, [modalVisible, editingLease, form]);

    const fetchLeases = async () => {
        setLoading(true);
        try {
            const response = await getLeaseList();
            setData(response);
            setFilteredData(response);
        } catch (error) {
            message.error("获取订单列表失败");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeases();
    }, []);

    const onSearch = (value: string) => {
        if (!value.trim()) {
            setFilteredData(data);
        } else {
            setFilteredData(
                data.filter((order) => order.order_number.includes(value))
            );
        }
    };

    const handleDelete = async (id: number) => {
        try {
            await deleteLease(id);
            message.success("订单已删除");
            fetchLeases();
        } catch (error) {
            message.error("删除失败，请重试");
        }
    };

    const handleEdit = (lease) => {
        setEditingLease(lease);
        setModalVisible(true);
        form.setFieldsValue(lease);
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();
            await updateLease(editingLease.id, values);
            message.success("订单信息已更新");
            fetchLeases();
            setModalVisible(false);
        } catch (error) {
            message.error("操作失败，请重试");
        }
    };

    const columns: TableProps["columns"] = [
        { title: "订单编号", dataIndex: "order_number", key: "order_number" },
        {
            title: "状态",
            dataIndex: "status",
            key: "status",
            render: (status) => {
                const statusColors = {
                    "待支付": "volcano",
                    "已支付": "green",
                    "已审核": "blue",
                    "已发货": "purple",
                    "已完成": "gold",
                    "已取消": "red"
                };
                return <Tag color={statusColors[status]}>{status}</Tag>;
            }
        },
        { title: "价格", dataIndex: "price", key: "price" },
        { title: "创建时间", dataIndex: "create_time", key: "create_time" },
        { title: "取货时间", dataIndex: "delivery_time", key: "delivery_time" },
        { title: "发货地址", dataIndex: "send_address", key: "send_address" },
        { title: "收货地址", dataIndex: "receiver_address", key: "receiver_address" },
        { title: "收货人", dataIndex: "receiver_name", key: "receiver_name" },
        { title: "电话", dataIndex: "receiver_phone", key: "receiver_phone" },
        {
            title: "操作",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" onClick={() => handleEdit(record)}>
                        更新
                    </Button>
                    <Button type="primary" danger onClick={() => handleDelete(record.id)}>
                        删除
                    </Button>
                </Space>
            )
        }
    ];

    return (
        <div>
            <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <Col>
                    <Space>
                        <Text>搜索订单：</Text>
                        <Search placeholder="输入订单编号" onSearch={onSearch} style={{ width: 200 }} />
                    </Space>
                </Col>
            </Row>
            <Table size="middle" rowKey="id" columns={columns} dataSource={filteredData} pagination={{ pageSize: 8 }} />
            <Modal title="更新订单" open={modalVisible} onOk={handleSave} onCancel={() => setModalVisible(false)} destroyOnClose>
                <Form form={form} layout="vertical">
                    <Form.Item name="status" label="订单状态" rules={[{ required: true, message: "请选择订单状态" }]}>
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
    );
};

export default LeaseTable;
