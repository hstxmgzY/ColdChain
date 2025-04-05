import React, { useState, useEffect } from "react"
import {
  Card,
  Descriptions,
  Modal,
  Form,
  Input,
  Button,
  message,
  Select,
} from "antd"
import { useUser } from "../../contexts/UserContext"
import { UserType, Address } from "../../interface/user/user"
import { updateUser } from "../../api/modules/user"

export default function ProfilePage() {
  const { userInfo, updateUserInfo } = useUser()
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [addressModalVisible, setAddressModalVisible] = useState(false)
  const [currentAddresses, setCurrentAddresses] = useState<Address[]>([])
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [form] = Form.useForm()
  const [addressForm] = Form.useForm()

  // 初始化地址数据
  useEffect(() => {
    if (userInfo?.address) {
      setCurrentAddresses([...userInfo.address])
    }
  }, [userInfo])

  // 处理个人信息修改
  const handleProfileUpdate = async (values: Partial<UserType>) => {
    try {
      if (!userInfo?.user_id) return

      const updatedUser = await updateUser(userInfo.user_id, values)
      updateUserInfo(updatedUser)
      message.success("个人信息更新成功")
      setEditModalVisible(false)
    } catch {
      message.error("更新失败，请重试")
    }
  }

  // 处理地址修改
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
        const index = currentAddresses.findIndex(
          (a) =>
            a.phone === editingAddress.phone &&
            a.detail === editingAddress.detail
        )
        newAddresses[index] = newAddress
      } else {
        newAddresses.push(newAddress)
      }

      await handleUpdateAddresses(newAddresses)
      setIsEditingAddress(false)
      setEditingAddress(null)
      addressForm.resetFields()
    } catch (error) {
      console.error("地址提交错误:", error)
    }
  }

  // 更新地址到服务器
  const handleUpdateAddresses = async (addresses: Address[]) => {
    if (!userInfo?.user_id) return

    try {
      const updatedUser = await updateUser(userInfo.user_id, {
        address: addresses,
      })
      updateUserInfo(updatedUser)
      setCurrentAddresses(addresses)
      message.success("地址更新成功")
    } catch (error) {
      message.error("地址更新失败")
    }
  }

  // 删除地址
  const handleDeleteAddress = (index: number) => {
    Modal.confirm({
      title: "确认删除地址？",
      content: "此操作不可恢复",
      onOk: () => {
        const newAddresses = currentAddresses.filter((_, i) => i !== index)
        handleUpdateAddresses(newAddresses)
      },
    })
  }

  return (
    <div>
      <Card
        title="个人信息"
        style={{ margin: 16 }}
        extra={
          <Button type="primary" onClick={() => setEditModalVisible(true)}>
            修改信息
          </Button>
        }
      >
        <Descriptions bordered column={1}>
          <Descriptions.Item label="用户名">
            {userInfo?.username}
          </Descriptions.Item>
          <Descriptions.Item label="联系方式">
            {userInfo?.phone}
          </Descriptions.Item>
          <Descriptions.Item label="所属部门">
            {userInfo?.role}
          </Descriptions.Item>
          <Descriptions.Item label="地址信息">
            {currentAddresses.length > 0 ? (
              currentAddresses.map((address, index) => (
                <div key={index} style={{ marginBottom: 8 }}>
                  <strong>{address.name}</strong>: {address.phone},{" "}
                  {address.detail}
                </div>
              ))
            ) : (
              <div>
                暂无地址
                <Button
                  type="link"
                  onClick={() => setAddressModalVisible(true)}
                >
                  新增地址
                </Button>
              </div>
            )}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 个人信息修改模态框 */}
      <Modal
        title="修改个人信息"
        visible={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={userInfo || {}}
          onFinish={handleProfileUpdate}
        >
          <Form.Item
            name="username"
            label="用户名"
            rules={[{ required: true, message: "请输入用户名" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="phone"
            label="联系电话"
            rules={[
              { required: true, message: "请输入联系电话" },
              { pattern: /^1[3-9]\d{9}$/, message: "手机号格式不正确" },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* 地址管理模态框 */}
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
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {currentAddresses.map((address, index) => (
            <Card
              key={`${address.phone}-${address.detail}`}
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
                  {address.name}
                </div>
                <div>
                  <strong>电话：</strong>
                  {address.phone}
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <strong>地址：</strong>
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
              rules={[{ required: true, message: "请输入收货人姓名" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="phone"
              label="联系电话"
              rules={[
                { required: true, message: "请输入联系电话" },
                { pattern: /^1[3-9]\d{9}$/, message: "手机号格式不正确" },
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
      </Modal>
    </div>
  )
}
