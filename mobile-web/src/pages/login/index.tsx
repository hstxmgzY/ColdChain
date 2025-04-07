import React, { useState, useEffect } from 'react'
import { Form, Input, Button, Tabs, Radio, Toast, Space, Dialog } from 'antd-mobile'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useUser } from '../../contexts/UserContext'
import { getCaptcha } from '../../api/modules/user'
import './index.css'

const Login: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [activeTab, setActiveTab] = useState<string>(searchParams.get('tab') || 'login')
  const [loading, setLoading] = useState<boolean>(false)
  const [captchaImg, setCaptchaImg] = useState<string>('')
  const [captchaId, setCaptchaId] = useState<string>('')
  const [loginForm] = Form.useForm()
  const [registerForm] = Form.useForm()
  const navigate = useNavigate()
  const { login, register } = useUser()

  // 获取验证码
  const fetchCaptcha = async () => {
    try {
      const captchaResponse = await getCaptcha(100, 300)
      if (captchaResponse && captchaResponse.img) {
        setCaptchaImg(captchaResponse.img)
        setCaptchaId(captchaResponse.id)
      } else {
        throw new Error('验证码数据无效')
      }
    } catch (error) {
      console.error('获取验证码失败:', error)
      Toast.show({
        content: '验证码加载失败',
        position: 'bottom'
      })
    }
  }

  // 初始化加载验证码
  useEffect(() => {
    fetchCaptcha()
  }, [])

  // 监听URL参数变化
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'login' || tab === 'signup') {
      setActiveTab(tab)
    }
  }, [searchParams])

  // 处理标签页切换
  const handleTabChange = (key: string) => {
    setActiveTab(key)
    setSearchParams({ tab: key })
  }

  // 处理登录提交
  const handleLoginSubmit = async (values: any) => {
    setLoading(true)
    try {
      await login(values.phone, values.password)
      Toast.show({
        content: '登录成功',
        position: 'bottom'
      })
      navigate('/profile')
    } catch (error) {
      console.error('登录失败:', error)
      Toast.show({
        content: '登录失败，请检查账号密码',
        position: 'bottom'
      })
      // 刷新验证码
      fetchCaptcha()
    } finally {
      setLoading(false)
    }
  }

  // 处理注册提交
  const handleRegisterSubmit = async (values: any) => {
    if (values.password !== values.confirmPassword) {
      Toast.show({
        content: '两次输入的密码不一致',
        position: 'bottom'
      })
      return
    }

    setLoading(true)
    try {
      await register({
        username: values.username,
        password: values.password,
        role: values.role,
        phone: values.phone,
        // user_id: 0 // 注册时由后端生成
      })

      Dialog.alert({
        content: '注册成功，请登录',
        onConfirm: () => {
          setActiveTab('login')
          setSearchParams({ tab: 'login' })
        },
      })
    } catch (error) {
      console.error('注册失败:', error)
      Toast.show({
        content: '注册失败，请稍后再试',
        position: 'bottom'
      })
    } finally {
      setLoading(false)
    }
  }

  // 返回首页
  const handleBack = () => {
    navigate('/')
  }

  return (
    <div className="mobile-login-container">
      <div className="login-header">
        <Button className="back-button" onClick={handleBack}>返回</Button>
        <h2>冷链物流管理系统</h2>
      </div>

      <div className="login-content">
        <Tabs activeKey={activeTab} onChange={handleTabChange}>
          <Tabs.Tab title="登录" key="login">
            <Form
              form={loginForm}
              layout="vertical"
              onFinish={handleLoginSubmit}
              footer={
                <Button
                  block
                  type="submit"
                  color="primary"
                  size="large"
                  loading={loading}
                >
                  登录
                </Button>
              }
            >
              <Form.Item
                name="phone"
                label="手机号"
                rules={[{ required: true, message: '请输入手机号' }]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input type="password" placeholder="请输入密码" />
              </Form.Item>

              <Form.Item label="验证码" required>
                <Space block>
                  <Form.Item
                    name="captchaCode"
                    noStyle
                    rules={[{ required: true, message: '请输入验证码' }]}
                  >
                    <Input placeholder="请输入验证码" />
                  </Form.Item>
                  <div className="captcha-container" onClick={fetchCaptcha}>
                    {captchaImg ? (
                      <img src={captchaImg} alt="验证码" />
                    ) : (
                      <div className="captcha-loading">加载中...</div>
                    )}
                  </div>
                </Space>
              </Form.Item>
            </Form>
          </Tabs.Tab>

          <Tabs.Tab title="注册" key="signup">
            <Form
              form={registerForm}
              layout="vertical"
              onFinish={handleRegisterSubmit}
              footer={
                <Button
                  block
                  type="submit"
                  color="primary"
                  size="large"
                  loading={loading}
                >
                  注册
                </Button>
              }
            >
              <Form.Item
                name="username"
                label="用户名"
                rules={[{ required: true, message: '请输入用户名' }]}
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="手机号"
                rules={[{ required: true, message: '请输入手机号' }]}
              >
                <Input placeholder="请输入手机号" />
              </Form.Item>

              <Form.Item
                name="role"
                label="用户类型"
                rules={[{ required: true, message: '请选择用户类型' }]}
              >
                <Radio.Group>
                  <Space direction="vertical">
                    <Radio value="individual">个人用户</Radio>
                    <Radio value="merchant">商业用户</Radio>
                  </Space>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="password"
                label="密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input type="password" placeholder="请输入密码" />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="确认密码"
                rules={[{ required: true, message: '请确认密码' }]}
              >
                <Input type="password" placeholder="请再次输入密码" />
              </Form.Item>
            </Form>
          </Tabs.Tab>
        </Tabs>
      </div>
    </div>
  )
}

export default Login