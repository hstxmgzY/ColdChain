import React, { useState, useEffect } from "react"
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
    Tooltip,
} from "antd"
import type { TableProps } from "antd"
import "../../mock/userMock"
import {
    getAlarmInfoList,
    deleteAlarmInfo,
    updateAlarmInfo,
    addAlarmInfo,
} from "../../api/modules/alarmInfo"
import { AlarmInfoType } from "../../interface/alarmInfo"

const { Search } = Input
const { Text } = Typography

const AlarmInfoTable: React.FC = () => {
    const [data, setData] = useState<AlarmInfoType[]>([])
    const [filteredData, setFilteredData] = useState<AlarmInfoType[]>([])
    const [modalVisible, setModalVisible] = useState(false)
    const [editingAlarmInfo, setEditingAlarmInfo] =
        useState<AlarmInfoType | null>(null)
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (modalVisible && editingAlarmInfo) {
            form.setFieldsValue(editingAlarmInfo)
        } else if (modalVisible) {
            form.resetFields()
        }
    }, [modalVisible, editingAlarmInfo, form])

    const fetchAlarmInfo = async () => {
        setLoading(true)
        try {
            const response = await getAlarmInfoList()
            setData(response)
            setFilteredData(response)
        } catch {
            message.error("获取用户列表失败")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchAlarmInfo()
    }, [])

    const onSearch = (value: string) => {
        if (!value.trim()) {
            setFilteredData(data)
        } else {
            setFilteredData(
                data.filter((alarmInfo) =>
                    alarmInfo.cold_chain_id.includes(value)
                )
            )
        }
    }

    const handleDelete = async (id: number) => {
        console.log("即将删除警报 ID:", id)
        try {
            const response = await deleteAlarmInfo(id)
            console.log("删除警报返回数据：", response)

            if (!response || response.code !== 200) {
                throw new Error(
                    `删除警报失败，返回数据：${JSON.stringify(response)}`
                )
            }

            message.success("警报已删除")
            fetchAlarmInfo()
        } catch (error) {
            console.error("删除警报出错:", error)
            message.error("删除失败，请重试")
        }
    }

    // 处理编辑用户
    const handleEdit = (alarm: AlarmInfoType) => {
        setEditingAlarmInfo(alarm)
        setModalVisible(true)
        form.setFieldsValue(alarm)
    }

    // 处理新增用户
    const handleAdd = () => {
        setEditingAlarmInfo(null)
        form.resetFields()
        setModalVisible(true)
    }

    const handleSave = async () => {
        try {
            const values = await form.validateFields()
            if (editingAlarmInfo) {
                await updateAlarmInfo(editingAlarmInfo.id, values)
                message.success("警报信息已更新")
            } else {
                await addAlarmInfo(values)
                message.success("新警报信息已添加")
            }
            fetchAlarmInfo()

            setModalVisible(false)
            // message.success(editingAlarmInfo ? "警报信息已更新" : "用户已添加")
        } catch {
            message.error("操作失败，请重试")
        }
    }

    const columns: TableProps<AlarmInfoType>["columns"] = [
        {
            title: "冷链模块ID",
            dataIndex: "cold_chain_id",
            key: "cold_chain_id",
            // width: 150,
        },
        {
            title: "冷链模块名称",
            dataIndex: "cold_chain_name",
            key: "cold_chain_name",
            // width: 150,
        },
        {
            title: "设备ID",
            dataIndex: "machine_id",
            key: "machine_id",
            // width: 100,
        },
        {
            title: "报警时间",
            dataIndex: "alarm_time",
            key: "alarm_time",
            // width: 180,
            render: (time) => new Date(time).toLocaleString(),
        },
        {
            title: "报警类型",
            dataIndex: "alarm_type",
            key: "alarm_type",
            // width: 120,
        },
        {
            title: "报警描述",
            dataIndex: "alarm_description",
            key: "alarm_description",
            ellipsis: true,
            render: (desc) => (
                <Tooltip title={desc}>
                    <span>{desc}</span>
                </Tooltip>
            ),
        },
        {
            title: "报警级别",
            dataIndex: "alarm_level",
            key: "alarm_level",
            render: (level) => {
                const levelColors: Record<string, string> = {
                    紧急: "red",
                    重要: "orange",
                    一般: "blue",
                }
                return <Tag color={levelColors[level]}>{level}</Tag>
            },
        },
        {
            title: "处理状态",
            dataIndex: "alarm_status",
            key: "alarm_status",
            render: (status) => {
                const statusColors: Record<string, string> = {
                    已读: "green",
                    暂不处理: "gray",
                }
                return <Tag color={statusColors[status]}>{status}</Tag>
            },
        },
        {
            title: "备注",
            dataIndex: "remark",
            key: "remark",
            ellipsis: true,
        },
        {
            title: "操作",
            key: "action",
            // width: 160,
            render: (_, record) => (
                <Space>
                    <Button size="small" onClick={() => handleEdit(record)}>
                        标记处理
                    </Button>
                    <Button
                        size="small"
                        danger
                        onClick={() => handleDelete(record.id)}
                    >
                        删除
                    </Button>
                </Space>
            ),
        },
    ]

    return (
        <>
            <div>
                <Row
                    justify="space-between"
                    align="middle"
                    gutter={[16, 16]}
                    style={{ marginBottom: 16 }}
                >
                    <Col>
                        <Space>
                            <Text>冷链模块ID：</Text>
                            <Search
                                placeholder="输入冷链模块ID"
                                onSearch={onSearch}
                                style={{ width: 200 }}
                            />
                        </Space>
                    </Col>
                    <Col>
                        <Button type="primary" onClick={handleAdd}>
                            新增警报
                        </Button>
                    </Col>
                </Row>

                <Table<AlarmInfoType>
                    bordered
                    size="small"
                    loading={loading}
                    rowKey="id"
                    columns={columns}
                    dataSource={filteredData}
                    pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                    }}
                    // scroll={{ x: 1500 }}
                />

                <Modal
                    title={editingAlarmInfo ? "处理报警" : "新建报警"}
                    open={modalVisible}
                    onOk={handleSave}
                    onCancel={() => setModalVisible(false)}
                    destroyOnClose
                    width={600}
                >
                    <Form form={form} layout="vertical" preserve={false}>
                        {/* 冷链选择（实际应接入冷链数据） */}
                        <Form.Item
                            name="cold_chain_id"
                            label="所属冷链"
                            rules={[{ required: true }]}
                        >
                            {/* <Select options=冷链选项数据 /> */}
                        </Form.Item>

                        {/* 设备ID */}
                        <Form.Item
                            name="machine_id"
                            label="设备编号"
                            rules={[{ required: true }]}
                        >
                            <Input />
                        </Form.Item>

                        {/* 报警类型 */}
                        <Form.Item
                            name="alarm_type"
                            label="报警类型"
                            rules={[{ required: true }]}
                        >
                            <Select
                                options={[
                                    { label: "温度异常", value: "temperature" },
                                    { label: "湿度异常", value: "humidity" },
                                    { label: "设备离线", value: "offline" },
                                ]}
                            />
                        </Form.Item>

                        {/* 报警级别 */}
                        <Form.Item
                            name="alarm_level"
                            label="严重级别"
                            initialValue="一般"
                        >
                            {/* <Select options={AlarmLevelOptions} /> */}
                        </Form.Item>

                        {/* 处理状态 */}
                        {editingAlarmInfo && (
                            <Form.Item
                                name="alarm_status"
                                label="处理状态"
                                rules={[{ required: true }]}
                            >
                                {/* <Select options={AlarmStatusOptions} /> */}
                            </Form.Item>
                        )}

                        {/* 报警描述 */}
                        <Form.Item
                            name="alarm_description"
                            label="详细描述"
                            rules={[{ required: true }]}
                        >
                            <Input.TextArea rows={3} />
                        </Form.Item>

                        {/* 备注信息 */}
                        <Form.Item name="remark" label="处理备注">
                            <Input.TextArea placeholder="请输入处理意见或说明" />
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </>
    )
}

export default AlarmInfoTable
