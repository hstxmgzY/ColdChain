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
    Card,
} from "antd"
import type { TableProps } from "antd"
import { UserType, Address } from "../../interface/user/user"
import { EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons"
// import "../../mock/userMock"
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
    const [editingUserAddress, setEditingUserAddress] = useState<UserType | null>(null)
    const [form] = Form.useForm()
    const [loading, setLoading] = useState(false)
    const [visiblePasswords, setVisiblePasswords] = useState<{
        [key: number]: boolean
    }>({})
    const [addressModalVisible, setAddressModalVisible] = useState(false)
    const [currentAddresses, setCurrentAddresses] = useState<Address[]>([])
    const [editingAddress, setEditingAddress] = useState<Address | null>(null)
    const [isEditingAddress, setIsEditingAddress] = useState(false)
    const [addressForm] = Form.useForm()

    const handleAddressSubmit = async () => {
        try {
            const values = await addressForm.validateFields()
            const newAddress = {
                name: values.name,
                phone: values.phone,
                detail: values.detail,
            }

            let newAddresses = [...currentAddresses]

            if (editingAddress) {
                // 使用唯一标识符查找地址（临时用phone+detail组合）
                const index = currentAddresses.findIndex(
                    (a) =>
                        a.phone === editingAddress.phone &&
                        a.detail === editingAddress.detail
                )

                if (index === -1) {
                    message.error("未找到要修改的地址")
                    return
                }

                // 创建新数组保证React状态更新
                newAddresses = newAddresses.map((item, i) =>
                    i === index ? newAddress : item
                )
            } else {
                newAddresses.push(newAddress)
            }

            await handleUpdateAddresses(newAddresses)
            console.log("提交的地址数据:", newAddresses) // 调试日志
            setIsEditingAddress(false)
            setEditingAddress(null)
            addressForm.resetFields() // 新增：提交后清空表单
        } catch (error) {
            console.error("地址提交错误:", error)
        }
    }

    const handleUpdateAddresses = async (newAddresses: Address[]) => {
        console.log("更新地址:", newAddresses) // 调试日志
        if (!editingUserAddress) {
            message.error("未找到相应用户信息")
            return
        }
        try {
            console.log("提交的地址数据:", newAddresses) // 调试日志
            const response = await updateUser(editingUserAddress.user_id, {
                address: newAddresses,
            })

            console.log("API响应:", response) // 调试日志

            if (response) {
                message.success("地址更新成功")
                setFilteredData((prev) =>
                    prev.map((user) =>
                        user.user_id === editingUserAddress.user_id
                            ? { ...user, address: newAddresses }
                            : user
                    )
                )
                setCurrentAddresses(newAddresses)
            } else {
                message.error(response || "地址更新失败")
            }
        } catch (error) {
            console.error("地址更新请求失败:", error)
            message.error("请求发送失败，请检查网络")
        }
    }

    // 修改删除地址的索引获取方式
    const handleDeleteAddress = (index: number) => {
        Modal.confirm({
            title: "确认删除地址？",
            content: "此操作不可恢复",
            onOk: () => {
                const newAddresses = currentAddresses.filter(
                    (_, i) => i !== index
                )
                handleUpdateAddresses([...newAddresses]) // 保证新数组引用
            },
        })
    }

    const AddressModalContent = () => (
        <>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {currentAddresses.map((address, index) => (
                    <Card
                        key={address.phone + address.detail}
                        title={`地址 ${index + 1}`}
                        size="small"
                        extra={[
                            <Button
                                key="edit"
                                type="link"
                                onClick={() => {
                                    setEditingAddress(address)
                                    addressForm.setFieldsValue(address)
                                    setIsEditingAddress(true)
                                }}
                            >
                                修改
                            </Button>,
                            <Button
                                key="delete"
                                type="link"
                                danger
                                onClick={() => handleDeleteAddress(index)}
                            >
                                删除
                            </Button>,
                        ]}
                    >
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, 1fr)",
                                gap: 8,
                            }}
                        >
                            <div>
                                <strong>收货人：</strong>
                                {address.name || "未填写"}
                            </div>
                            <div>
                                <strong>联系电话：</strong>
                                {address.phone}
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                                <strong>详细地址：</strong>
                                {address.detail}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* 地址编辑模态框 */}
            <Modal
                title={editingAddress ? "修改地址" : "新增地址"}
                visible={isEditingAddress}
                onOk={handleAddressSubmit}
                onCancel={() => {
                    setIsEditingAddress(false)
                    setEditingAddress(null)
                }}
            >
                <Form form={addressForm} layout="vertical">
                    <Form.Item
                        name="name"
                        label="收货人"
                        rules={[
                            { required: true, message: "请输入收货人姓名" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="phone"
                        label="联系电话"
                        rules={[
                            { required: true, message: "请输入联系电话" },
                            {
                                pattern: /^1[3-9]\d{9}$/,
                                message: "手机号格式不正确",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="detail"
                        label="详细地址"
                        rules={[{ required: true, message: "请输入详细地址" }]}
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    )

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
            const UserList:UserType[] = response
            setData(UserList)
            setFilteredData(UserList)
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

            if (response.message !== "用户删除成功") {
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
        } catch (error) {
            if (error === "有重复的记录") {
                message.error("电话号码重复，请修改！")
            } else {
                message.error("操作失败，请重试")
            }
        }
    }

    const columns: TableProps<UserType>["columns"] = [
        { title: "用户名", dataIndex: "username", key: "username" },
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
                    manager: "冷链业务管理员",
                    individual: "个人用户",
                    merchant: "商户用户",
                }
                return <Tag color={roleColors[role]}>{roleMap[role]}</Tag>
            },
        },
        { title: "电话号码", dataIndex: "phone", key: "phone" },
        {
            title: "地址",
            dataIndex: "address",
            key: "address",
            render: (addresses: Address[], record: UserType) => {
                const addressCount = addresses?.length || 0

                return (
                    <Button
                        type="link"
                        onClick={() => {
                            setEditingUserAddress(record)
                            setCurrentAddresses(addresses || []) // 确保总是数组
                            setAddressModalVisible(true)
                        }}
                    >
                        {addressCount > 0
                            ? `查看地址(${addressCount}条)`
                            : `暂无地址，点击添加`}
                    </Button>
                )
            },
        },
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
                                冷链业务管理员
                            </Select.Option>
                            <Select.Option value="individual">
                                个人用户
                            </Select.Option>
                            <Select.Option value="merchant">
                                商户用户
                            </Select.Option>
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
            <Modal
                title="地址管理"
                visible={addressModalVisible}
                onCancel={() => setAddressModalVisible(false)}
                footer={[
                    <Button
                        key="add"
                        type="primary"
                        onClick={() => {
                            addressForm.resetFields()
                            setIsEditingAddress(true)
                            setEditingAddress(null)
                        }}
                    >
                        添加新地址
                    </Button>,
                ]}
                width={800}
            >
                <AddressModalContent />
            </Modal>
        </div>
    )
}

export default UserTable
