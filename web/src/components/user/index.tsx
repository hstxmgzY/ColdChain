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
import { UserType } from "../../interface/user/user"
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons"
import "../../mock/userMock"
import {
    getUserList,
    deleteUser,
    updateUser,
    addUser,
} from "../../api/modules/user"

const { Search } = Input
const { Text } = Typography

const UserTable: React.FC = () => {
    const [data, setData] = useState<UserType[]>([])
    const [filteredData, setFilteredData] = useState<UserType[]>([])
    const [modalVisible, setModalVisible] = useState(false)
    const [editingUser, setEditingUser] = useState<UserType | null>(null)
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [visiblePasswords, setVisiblePasswords] = useState<{
        [key: number]: boolean
    }>({})

    // 切换密码显示状态
    const togglePassword = (key: number) => {
        setVisiblePasswords((prev) => ({
            ...prev,
            [key]: !prev[key], // 切换状态
        }))
    }

    useEffect(() => {
        if (modalVisible && editingUser) {
            form.setFieldsValue(editingUser)
        } else if (modalVisible) {
            form.resetFields()
        }
    }, [modalVisible, editingUser, form])

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const response = await getUserList()
            setData(response)
            setFilteredData(response)
        } catch {
            message.error("获取用户列表失败")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const onSearch = (value: string) => {
        if (!value.trim()) {
            setFilteredData(data)
        } else {
            setFilteredData(
                data.filter((user) => user.username.includes(value))
            )
        }
    }

    const handleDelete = async (user_id: number) => {
        console.log("即将删除用户 ID:", user_id)
        try {
            const response = await deleteUser(user_id)
            console.log("删除用户返回数据：", response)

            if (!response || response.code !== 200) {
                throw new Error(
                    `删除用户失败，返回数据：${JSON.stringify(response)}`
                )
            }

            message.success("用户已删除")
            fetchUsers()
        } catch (error) {
            console.error("删除用户出错:", error)
            message.error("删除失败，请重试")
        }
    }

    // 处理编辑用户
    const handleEdit = (user: UserType) => {
        setEditingUser(user)
        setModalVisible(true)
        form.setFieldsValue(user)
    }

    // 处理新增用户
    const handleAdd = () => {
        setEditingUser(null)
        form.resetFields()
        setModalVisible(true)
    }

    const handleSave = async () => {
        try {
            const values = await form.validateFields()
            if (editingUser) {
                // 保留原有密码如果未修改
                const updatedUser = {
                    ...editingUser,
                    ...values,
                    password: values.password || editingUser.password,
                }
                await updateUser(editingUser.user_id, values)
                message.success("用户信息已更新")

                setFilteredData((prev) =>
                    prev.map((user) =>
                        user.user_id === editingUser.user_id
                            ? updatedUser
                            : user
                    )
                )
            } else {
                await addUser(values)
                message.success("用户已添加")
                fetchUsers()
            }

            setModalVisible(false)
            message.success(editingUser ? "用户信息已更新" : "用户已添加")
        } catch {
            message.error("操作失败，请重试")
        }
    }

    const columns: TableProps<UserType>["columns"] = [
        { title: "用户名", dataIndex: "username", key: "username" },
        // {
        //     title: "用户密码",
        //     dataIndex: "password",
        //     key: "password",
        //     width: 250,
        //     render: (_, record) => {
        //         const isVisible = visiblePasswords[record.user_id] // 获取当前行的密码状态
        //         return (
        //             <div
        //                 style={{
        //                     display: "flex",
        //                     alignItems: "center",
        //                     justifyContent: "space-around",
        //                 }}
        //             >
        //                 <span style={{ marginRight: 8 }}>
        //                     {isVisible ? record.password : "**************"}
        //                 </span>
        //                 <Tooltip title={isVisible ? "隐藏密码" : "显示密码"}>
        //                     {isVisible ? (
        //                         <EyeInvisibleOutlined
        //                             style={{ cursor: "pointer" }}
        //                             onClick={() =>
        //                                 togglePassword(record.user_id)
        //                             }
        //                         />
        //                     ) : (
        //                         <EyeOutlined
        //                             style={{ cursor: "pointer" }}
        //                             onClick={() =>
        //                                 togglePassword(record.user_id)
        //                             }
        //                         />
        //                     )}
        //                 </Tooltip>
        //             </div>
        //         )
        //     },
        // },
        {
            title: "用户权限",
            dataIndex: "role",
            key: "role",
            render: (role) => {
                const roleColors: Record<string, string> = {
                    admin: "volcano",
                    manager: "green",
                    individual: "blue",
                    merchant: "purple",
                }
                const roleMap: Record<string, string> = {
                    admin: "系统管理员",
                    manager: "冷链运输管理员",
                    individual: "个人用户",
                    merchant: "商户用户",
                }
                return <Tag color={roleColors[role]}>{roleMap[role]}</Tag>
            },
        },
        { title: "电话号码", dataIndex: "phone", key: "phone" },
        { title: "地址", dataIndex: "address", key: "address" },
        {
            title: "操作",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Button type="primary" onClick={() => handleEdit(record)}>
                        更新
                    </Button>
                    <Button
                        type="primary"
                        danger
                        onClick={() => handleDelete(record.user_id)}
                    >
                        删除
                    </Button>
                </Space>
            ),
        },
    ]

    return (
        <div>
            <Row
                justify="space-between"
                align="middle"
                gutter={[16, 16]}
                style={{ marginBottom: 16 }}
            >
                <Col>
                    <Space>
                        <Text>搜索用户：</Text>
                        <Search
                            placeholder="输入用户名"
                            onSearch={onSearch}
                            style={{ width: 200 }}
                        />
                    </Space>
                </Col>
                <Col>
                    <Button type="primary" onClick={handleAdd}>
                        新增用户
                    </Button>
                </Col>
            </Row>
            <Table<UserType>
                loading={loading}
                size="middle"
                rowKey="user_id"
                columns={columns}
                dataSource={filteredData}
                pagination={{ pageSize: 8 }}
            />

            <Modal
                title={editingUser ? "更新用户" : "新增用户"}
                open={modalVisible}
                onOk={handleSave}
                onCancel={() => setModalVisible(false)}
                destroyOnClose
            >
                <Form
                    form={form}
                    layout="vertical"
                    preserve={false}
                    initialValues={
                        editingUser
                            ? {
                                  username: editingUser.username,
                                  role: editingUser.role,
                                  phone: editingUser.phone,
                              }
                            : {}
                    }
                >
                    <Form.Item
                        name="username"
                        label="用户名"
                        rules={[{ required: true, message: "请输入用户名" }]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        label="密码"
                        rules={[
                            { required: !editingUser, message: "请输入密码" },
                        ]}
                    >
                        <Input.Password
                            placeholder={
                                editingUser ? "留空则不修改密码" : "请输入密码"
                            }
                            autoComplete="new-password"
                        />
                    </Form.Item>

                    <Form.Item
                        name="role"
                        label="权限"
                        rules={[{ required: true, message: "请选择权限" }]}
                    >
                        <Select placeholder="请选择权限">
                            <Select.Option value="admin">
                                系统管理员
                            </Select.Option>
                            <Select.Option value="manager">
                                冷链运输管理员
                            </Select.Option>
                            <Select.Option value="individual">个人用户</Select.Option>
                            <Select.Option value="merchant">商户用户</Select.Option>
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="phone"
                        label="电话号码"
                        rules={[
                            { required: true, message: "请输入电话号码" },
                            {
                                pattern: /^1[3-9]\d{9}$/,
                                message: "请输入有效的手机号码",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default UserTable
