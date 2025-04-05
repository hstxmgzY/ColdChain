import React, { useState, useEffect } from "react"
import { Form, Input, Button, Tabs, Radio, message } from "antd"
import { CSSTransition } from "react-transition-group"
import { CloseOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import { login, addUser, getCaptcha, getUserById } from "../../api/modules/user"
import { http } from "../../api/request"
import { useSearchParams } from "react-router-dom"
import "./index.css"
import { useDispatch } from "react-redux"
import { updateUserInfo } from "../../store/reducers/user"
import { CaptchaData, LoginData, RegisterData } from "../../interface/user/user"
import { use } from "echarts/types/src/extension.js"

interface LoginProps {
    onLogin?: (userData: any) => void
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [activeTab, setActiveTab] = useState(
        searchParams.get("tab") || "login"
    )
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const [captchaImg, setCaptchaImg] = useState<string>("")
    const [currentCaptchaId, setCurrentCaptchaId] = useState("")

    useEffect(() => {
        const fetchCaptcha = async () => {
            try {
                const captcha = await getCaptcha(400, 1000)
                console.log("验证码 API 响应:", captcha)

                if (captcha && captcha.img) {
                    // ✅ 修正大小写 (img)
                    setCaptchaImg(captcha.img) // ✅ 更新验证码图片
                    setCurrentCaptchaId(captcha.id) // ✅ 更新验证码 ID
                    setSearchParams({ captchaId: captcha.id }) // ✅ 保持参数同步
                } else {
                    throw new Error("验证码数据无效")
                }
            } catch (error) {
                console.error("获取验证码失败:", error)
                message.error("验证码加载失败")
            }
        }

        fetchCaptcha()
    }, [])

    const dispatch = useDispatch()
    const [coolDown, setcoolDown] = useState(0)

    useEffect(() => {
        const tab = searchParams.get("tab")
        if (tab === "login" || tab === "signup") {
            setActiveTab(tab)
        }
    }, [searchParams])

    useEffect(() => {
        let timer: ReturnType<typeof setInterval> | undefined
        if (coolDown > 0) {
            timer = setInterval(() => {
                setcoolDown((prev) => prev - 1)
            }, 1000)
        }
        return () => clearInterval(timer)
    }, [coolDown])

    const handleClose = () => {
        navigate("/")
    }

    const handleTabChange = (key: string) => {
        setActiveTab(key)
        setSearchParams({ tab: key })
    }

    const renderSignupForm = () => (
        <>
            <Form.Item
                label="用户名"
                name="username"
                rules={[{ required: true, message: "请输入您的姓名" }]}
            >
                <Input placeholder="请输入您的姓名" size="large" />
            </Form.Item>

            <Form.Item
                label="Phone"
                name="phone"
                rules={[
                    {
                        required: true,
                        message: "请输入您的手机号！",
                    },
                ]}
            >
                <Input placeholder="请输入您的手机号" size="large" />
            </Form.Item>

            <Form.Item
                label="Role"
                name="role"
                rules={[{ required: true, message: "请输入用户类型" }]}
            >
                <Radio.Group>
                    <div
                        style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: "16px",
                        }}
                    >
                        <Radio value="admin" style={{ flex: "1 1 45%" }}>
                            管理员
                        </Radio>
                        <Radio value="manager" style={{ flex: "1 1 45%" }}>
                            冷链业务管理员
                        </Radio>
                        <Radio value="individual" style={{ flex: "1 1 45%" }}>
                            个人用户
                        </Radio>
                        <Radio value="merchant" style={{ flex: "1 1 45%" }}>
                            商业用户
                        </Radio>
                    </div>
                </Radio.Group>
            </Form.Item>

            <Form.Item
                label="Password"
                name="password"
                rules={[{ required: true, message: "请输入您的密码!" }]}
            >
                <Input.Password placeholder="请输入您的密码" size="large" />
            </Form.Item>

            <Form.Item
                label="Confirm Password"
                name="confirmPassword"
                dependencies={["password"]}
                rules={[
                    {
                        required: true,
                        message: "请确认您输入的密码!",
                    },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue("password") === value) {
                                return Promise.resolve()
                            }
                            return Promise.reject(new Error("密码不匹配!"))
                        },
                    }),
                ]}
            >
                <Input.Password placeholder="请确认您输入的密码" size="large" />
            </Form.Item>
        </>
    )

    const renderLoginForm = () => (
        <>
            <Form.Item
                label="手机号"
                name="phone"
                rules={[
                    {
                        required: true,
                        message: "请输入您的手机号！",
                    },
                ]}
            >
                <Input placeholder="请输入您的手机号" size="large" />
            </Form.Item>

            <Form.Item
                label="密码"
                name="password"
                rules={[{ required: true, message: "请输入您的密码!" }]}
            >
                <Input.Password placeholder="请输入您的密码" size="large" />
            </Form.Item>
            <Form.Item label="验证码" name="captchaCode">
                <div style={{ display: "flex", alignItems: "center" }}>
                    <Input
                        placeholder="请输入验证码"
                        size="large"
                        style={{ width: "200px" }}
                    />
                    <img
                        src={captchaImg}
                        alt="验证码"
                        style={{
                            marginLeft: "10px",
                            cursor: "pointer",
                            width: "120px",
                            height: "40px",
                            objectFit: "contain",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                        }}
                        onClick={async () => {
                            try {
                                const captcha = await getCaptcha(40, 100)
                                console.log("新验证码数据:", captcha)

                                if (captcha && captcha.img) {
                                    // ✅ 修正大小写
                                    setCaptchaImg(captcha.img)
                                    setCurrentCaptchaId(captcha.id)
                                    setSearchParams({ captchaId: captcha.id })
                                } else {
                                    throw new Error("获取验证码失败")
                                }
                            } catch (error) {
                                message.error("刷新验证码失败")
                            }
                        }}
                    />
                </div>
            </Form.Item>
        </>
    )

    // async function handleLogin(
    //     values: LoginData,
    //     action: "login"
    // ): Promise<void>
    // async function handleLogin(
    //     values: RegisterData,
    //     action: "register"
    // ): Promise<void>
    async function handleLogin(
        values: LoginData | RegisterData,
        action: "login" | "register"
    ) {
        if (loading || coolDown > 0) return
        setLoading(true)

        try {
            let response

            if (action === "login") {
                // const captcha: CaptchaData = await getCaptcha()
                // console.log("验证码 ID:", currentCaptchaId)
                // console.log("验证码代码:", (values as LoginData).captchaCode)
                // console.log(values.phone.trim())
                response = await login({
                    phone: values.phone.trim(),
                    password: values.password,
                    captcha_id: currentCaptchaId,
                    captcha_answer: (values as LoginData).captchaCode,
                })
                // console.log("登录响应:", response)
            } else {
                // console.log("注册数据:", values)
                const data = {
                    username: (values as RegisterData).username.trim(),
                    password: values.password,
                    phone: values.phone,
                    role: "individual",
                }
                response = await addUser(data)
                // console.log("注册响应:", response)

            }



            // 检查响应中是否存在token，如果不存在则生成一个模拟token
            // let token = response.headers?.authorization
            
            // // 如果后端没有返回token，创建一个模拟token
            // if (!token) {
            //     console.log('后端未返回token，创建模拟token')
            //     // 创建一个简单的模拟token
            //     token = `mock_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
            // }

            // localStorage.setItem("id", token)
            
            // 登录成功后获取用户信息
            if (action === "login") {
                try {
                    // 尝试从API获取用户信息
                    const userResponse = await getUserById(response.user_id)
                    console.log("用户信息 API 响应:", userResponse)
                    if (userResponse) {
                        // 将用户存储到Redux
                        dispatch(updateUserInfo(userResponse))
                        // 将用户信息存储到localStorage
                        localStorage.setItem('userInfo', JSON.stringify(userResponse))
                    } else {
                        // 如果API没有返回用户信息，创建一个模拟用户信息
                        const mockUserInfo = {
                            id: Date.now(),
                            username: values.phone.substring(0, 3) + '****' + values.phone.substring(7),
                            phone: values.phone,
                            role: 'individual',
                            created_at: new Date().toISOString()
                        }
                        // 将模拟用户信息存储到Redux
                        dispatch(updateUserInfo(mockUserInfo))
                        // 将模拟用户信息存储到localStorage
                        localStorage.setItem('userInfo', JSON.stringify(mockUserInfo))
                    }
                } catch (error) {
                    console.error('获取用户信息失败:', error)
                    // 创建一个模拟用户信息
                    const mockUserInfo = {
                        id: Date.now(),
                        username: values.phone.substring(0, 3) + '****' + values.phone.substring(7),
                        phone: values.phone,
                        role: 'individual',
                        created_at: new Date().toISOString()
                    }
                    // 将模拟用户信息存储到Redux
                    dispatch(updateUserInfo(mockUserInfo))
                    // 将模拟用户信息存储到localStorage
                    localStorage.setItem('userInfo', JSON.stringify(mockUserInfo))
                }
            }
            
            message.success(action === "login" ? "登录成功" : "注册成功")
            navigate("/home")
        } catch (error) {
            console.error("Error:", error)
            message.error(error.message || "操作失败，请稍后重试")
            setcoolDown(5)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="login-container">
            <CloseOutlined
                className="close-icon"
                onClick={handleClose}
                style={{
                    position: "absolute",
                    top: "10%",
                    right: "15%",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "#2e2e2e",
                    width: "40px",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "2px solid #2e2e2e",
                    borderRadius: "50%",
                }}
            />

            <h1 className="login-title">欢迎来到冷链管理系统</h1>

            <Tabs
                activeKey={activeTab}
                onChange={handleTabChange}
                centered
                className="login-tabs"
            >
                <Tabs.TabPane
                    tab="LOG IN"
                    key="login"
                    className="login-tab-btn"
                />
                <Tabs.TabPane
                    tab="SIGN UP"
                    key="signup"
                    className="login-tab-btn"
                />
            </Tabs>

            <CSSTransition
                in={activeTab === "login" || activeTab === "signup"}
                timeout={300}
                classNames="form-transition"
                unmountOnExit
            >
                <Form
                    name={activeTab === "login" ? "loginForm" : "signupForm"}
                    onFinish={(values) =>
                        handleLogin(
                            values,
                            activeTab === "login" ? "login" : "register"
                        )
                    }
                    layout="vertical"
                    requiredMark={false}
                    className="login-form"
                >
                    {activeTab === "signup"
                        ? renderSignupForm()
                        : renderLoginForm()}

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            block
                            size="large"
                            className="login-btn"
                            loading={loading}
                            disabled={loading || coolDown > 0}
                        >
                            {loading
                                ? activeTab === "login"
                                    ? "登录中..."
                                    : "注册中..."
                                : coolDown > 0
                                  ? `请等待 ${coolDown} 秒`
                                  : activeTab === "login"
                                    ? "LOGIN"
                                    : "SIGN UP"}
                        </Button>
                    </Form.Item>
                </Form>
            </CSSTransition>
        </div>
    )
}

export default Login
