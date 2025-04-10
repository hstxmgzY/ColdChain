import React, { useState, useEffect } from 'react'
import {
  NavBar,
  Form,
  Input,
  Button,
  List,
  Modal,
  Popup,
  Toast,
  Card,
  Avatar,
  TextArea
} from 'antd-mobile'
import {
  EditFill,
  DeleteOutline,
  AddOutline,
  LeftOutline
} from 'antd-mobile-icons'
import { useUser } from '../../contexts/UserContext'
import { UserType, Address } from '../../interface/user/user'
import { updateUser } from '../../api/modules/user'
import imgUrl from '../../../public/c3b.png'


const Profile = () => {
  const { userInfo, updateUserInfo, logout } = useUser()
  const [profileForm] = Form.useForm()
  const [addressForm] = Form.useForm()
  const [addressVisible, setAddressVisible] = useState(false)
  const [editIndex, setEditIndex] = useState<number | null>(null)
  const [currentAddresses, setCurrentAddresses] = useState<Address[]>([])
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    if (userInfo?.address) {
      setCurrentAddresses([...userInfo.address])
    }
    profileForm.setFieldsValue({
      username: userInfo?.username || '',
      phone: userInfo?.phone || '',
      role_name: userInfo?.role || ''
    })
  }, [userInfo])

  const handleProfileSubmit = async () => {
    try {
      const values = await profileForm.validateFields()
      const updatedUser = await updateUser(userInfo!.user_id, values)
      updateUserInfo(updatedUser)
      Toast.show({ icon: 'success', content: '信息更新成功' })
      setEditMode(false)
    } catch (error) {
      Toast.show({ icon: 'fail', content: '更新失败' })
    }
  }

  const handleAddressSubmit = async () => {
    try {
      const values = await addressForm.validateFields()
      const newAddress = {
        name: values.name,
        phone: values.phone,
        detail: values.detail,
        isDefault: values.isDefault
      }

      let updatedAddresses = [...currentAddresses]
      if (editIndex !== null) {
        updatedAddresses[editIndex] = newAddress
      } else {
        updatedAddresses.push(newAddress)
      }

      if (newAddress.isDefault) {
        updatedAddresses = updatedAddresses.map(addr => ({
          ...addr,
          isDefault: addr === newAddress
        }))
      }

      await updateUserAddresses(updatedAddresses)
      setAddressVisible(false)
      setEditIndex(null)
    } catch (error) {
      console.error('地址验证失败:', error)
    }
  }

  const updateUserAddresses = async (addresses: Address[]) => {
    try {
      const updatedUser = await updateUser(userInfo!.user_id, {
        address: addresses
      })
      updateUserInfo(updatedUser)
      setCurrentAddresses(addresses)
      Toast.show({ icon: 'success', content: '地址已更新' })
    } catch (error) {
      Toast.show({ icon: 'fail', content: '更新失败' })
    }
  }

  const handleDeleteAddress = (index: number) => {
    Modal.show({
      content: '确定要删除这个地址吗？',
      actions: [
        {
          key: 'delete',
          text: '删除',
          danger: true,
          async onClick() {
            const newAddresses = currentAddresses.filter((_, i) => i !== index)
            await updateUserAddresses(newAddresses)
          }
        },
        { key: 'cancel', text: '取消' }
      ]
    })
  }

  return (
    <div className="address-manager">
      <NavBar
        backArrow={<LeftOutline />}
        right={
          <Button
            size="small"
            fill="none"
            onClick={() => setEditMode(prev => !prev)}
          >
            {editMode ? '取消修改' : '修改信息'}
          </Button>
        }
        onBack={() => window.history.back()}
      >
        个人信息管理
      </NavBar>

      <Card
        style={{
          margin: '12px',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
      >
        {editMode ? (
          <Form
            form={profileForm}
            layout="vertical"
            footer={
              <Button block color="primary" onClick={handleProfileSubmit} size="large">
                保存修改
              </Button>
            }
            style={{ padding: '12px' }}
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: '请输入用户名' }]}
            >
              <Input placeholder="请输入用户名" clearable />
            </Form.Item>
            <Form.Item
              name="phone"
              label="手机号"
              rules={[
                { required: true, message: '请输入手机号' },
                { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
              ]}
            >
              <Input placeholder="请输入手机号" maxLength={11} />
            </Form.Item>
            <Form.Item name="role_name" label="用户角色">
              <Input disabled />
            </Form.Item>
          </Form>
        ) : (
          <div style={{ padding: '12px', display: 'flex', alignItems: 'center' }}>
            <Avatar
              src={imgUrl} style={{ '--size': '64px' }}
            >

            </Avatar>

            <div style={{ marginLeft: '12px' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>
                {userInfo?.username || '用户名'}
              </div>
              <div style={{ color: '#888', marginTop: '4px' }}>
                {userInfo?.phone || '手机号'}
              </div>
              <div style={{ color: '#888', marginTop: '4px' }}>
                角色：{userInfo?.role || '未知'}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* 地址列表 */}
      <Card
        title="收货地址"
        style={{
          margin: '12px',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
        extra={
          <Button
            size="small"
            color="primary"
            onClick={() => {
              addressForm.resetFields()
              setAddressVisible(true)
              setEditIndex(null)
            }}
          >
            <AddOutline /> 新增地址
          </Button>
        }
      >
        <List>
          {currentAddresses.map((address, index) => (
            <List.Item
              key={index}
              extra={
                <div className="address-actions">
                  <Button
                    shape="rounded"
                    fill="none"
                    onClick={() => {
                      addressForm.setFieldsValue(address)
                      setEditIndex(index)
                      setAddressVisible(true)
                    }}
                  >
                    <EditFill />
                  </Button>
                  <Button
                    shape="rounded"
                    fill="none"
                    color="danger"
                    onClick={() => handleDeleteAddress(index)}
                  >
                    <DeleteOutline />
                  </Button>
                </div>
              }
            >
              <div className="address-content">
                <div>
                  {address.name} {address.phone}
                </div>
                <div className="address-detail">{address.detail}</div>
              </div>
            </List.Item>
          ))}
          {currentAddresses.length === 0 && (
            <List.Item>
              <div style={{ textAlign: 'center', color: '#999' }}>
                暂无收货地址
              </div>
            </List.Item>
          )}
        </List>
      </Card>

      {/* 地址编辑弹窗 */}
      <Popup
        visible={addressVisible}
        onMaskClick={() => setAddressVisible(false)}
        position="right"
        bodyStyle={{ width: '100vw' }}
      >
        <NavBar
          onBack={() => setAddressVisible(false)}
          right={
            <Button color="primary" fill="none" onClick={handleAddressSubmit}>
              保存
            </Button>
          }
        >
          {editIndex !== null ? '编辑地址' : '新增地址'}
        </NavBar>
        <Form
          form={addressForm}
          initialValues={{ isDefault: false }}
          style={{ padding: '12px' }}
        >
          <Form.Item
            name="name"
            label="收货人"
            rules={[{ required: true, message: '请输入收货人姓名' }]}
          >
            <Input placeholder="请输入姓名" clearable />
          </Form.Item>
          <Form.Item
            name="phone"
            label="联系电话"
            rules={[
              { required: true, message: '请输入联系电话' },
              { pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确' }
            ]}
          >
            <Input placeholder="请输入手机号" maxLength={11} />
          </Form.Item>
          <Form.Item
            name="detail"
            label="详细地址"
            rules={[{ required: true, message: '请输入详细地址' }]}
          >
            <TextArea
              placeholder="例如：XX区XX路XX号"
              rows={3}
              showCount
              maxLength={100}
            />
          </Form.Item>
        </Form>
      </Popup>

      {/* 底部退出按钮 */}
      <div style={{ padding: '12px', marginTop: '12px' }}>
        <Button block color="danger" size="large" onClick={logout}>
          退出
        </Button>
      </div>

      <style jsx>{`
        .address-actions {
          display: flex;
          gap: 8px;
        }
        .address-content {
          font-size: 14px;
          line-height: 1.5;
        }
        .address-detail {
          color: #666;
          margin-top: 4px;
        }
      `}</style>
    </div>
  )
}

export default Profile
