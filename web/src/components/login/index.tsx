import React, { useState, useEffect } from "react"
import { Form, Input, Button, Tabs, Radio, message } from "antd"
import { CSSTransition } from "react-transition-group"
import { CloseOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import { login, addUser, getCaptcha } from "../../api/modules/user"
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

    useEffect(() => {
        const fetchCaptcha = async () => {
            const captcha: CaptchaData = await getCaptcha()
            setCaptchaImg(captcha.Img)
            setSearchParams({ captchaId: captcha.Id })
        }
        fetchCaptcha()
    }, [setSearchParams])
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
                label="Name"
                name="name"
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
                        }}
                        onClick={async () => {
                            const captcha: CaptchaData = await getCaptcha()
                            setCaptchaImg(captcha.Img)
                            setSearchParams({ captchaId: captcha.Id })
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
                const captcha: CaptchaData = await getCaptcha()
                response = await login({
                    phone: values.phone.trim(),
                    password: values.password,
                    captchaId: captcha.Id,
                    captchaCode: (values as LoginData).captchaCode,
                })
            } else {
                const data = {
                    username: (values as RegisterData).username.trim(),
                    password: values.password,
                    phone: values.phone,
                    role: "individual",
                }
                response = await addUser(data)
            }

            const token = response.headers.authorization
            if (!token) {
                throw new Error(
                    action === "login" ? "手机号或密码错误！" : "注册失败！"
                )
            }

            localStorage.setItem("token", token)
            message.success(action === "login" ? "登录成功" : "注册成功")
            navigate("/")
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
                    onFinish={handleLogin}
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
