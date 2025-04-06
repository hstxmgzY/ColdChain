import Main from "../pages/main"
import Home from "../pages/home"
import {
    createBrowserRouter,
    Navigate,
    Outlet,
} from "react-router-dom"
import Order from "../pages/order"
import Lease from "../pages/order/lease"
import Monitor from "../pages/order/monitor"
import Review from "../pages/order/review"
import Tracking from "../pages/order/tracking"
import Resources from "../pages/resources"
import Dispatch from "../pages/resources/dispatch"
import Equipment from "../pages/resources/equipment"
import Product from "../pages/resources/product"
import ProductTrans from "../pages/resources/productTrans"
import Vehicle from "../pages/resources/vehicle"
import Alarm from "../pages/screen/alarm"
import Screen from "../pages/screen"
import Map from "../pages/screen/map"
import User from "../pages/user"
import EquipmentStats from "../pages/screen/equipmentStats"
import LoginPage from "../pages/user/LoginPage"
import ProfilePage from "../pages/user/ProfilePage"
import Welcome from "../pages/welcome"
import { useEffect } from "react"
import { message } from "antd"

// 路由守卫组件，用于保护需要登录才能访问的路由
const ProtectedRoute = () => {
    // 从 localStorage 获取并解析用户信息
    const userInfoString = localStorage.getItem("userInfo")
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null

    useEffect(() => {
        // 当 userInfo 无效时显示错误提示
        if (!userInfo?.user_id) {
            message.error("请先登录")
        }
    }, [userInfo]) // 依赖项确保信息变化时更新提示

    // 核心判断逻辑：检查是否存在有效的用户ID
    if (!userInfo?.user_id) {
        return <Navigate to="/" replace />
    }

    // 已登录则渲染子路由
    return <Outlet />
}

const routes = [
    // 欢迎页面 - 未登录状态下的主页
    {
        path: "/",
        element: <Welcome />,
    },
    // 需要登录保护的路由
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: "/user/profile",
                element: <ProfilePage />,
            },
        ],
    },
    // 登录/注册页面
    {
        path: "/login",
        element: <LoginPage />,
    },
    // 受保护的路由 - 需要登录才能访问
    {
        path: "/home",
        element: <ProtectedRoute />,
        children: [
            {
                element: <Main />,
                children: [
                    {
                        path: "", // /home 路径
                        element: <Home />,
                    },
                    {
                        path: "user", // /home/user 路径
                        element: <User />,
                    },
                    {
                        path: "order", // /home/order 路径
                        element: <Order />,
                        children: [
                            {
                                path: "lease",
                                element: <Lease />,
                            },
                            {
                                path: "monitor",
                                element: <Monitor />,
                            },
                            {
                                path: "review",
                                element: <Review />,
                            },
                            {
                                path: "tracking",
                                element: <Tracking />,
                            },
                        ],
                    },
                    {
                        path: "resource", // /home/resource 路径
                        element: <Resources />,
                        children: [
                            {
                                path: "dispatch",
                                element: <Dispatch />,
                            },
                            {
                                path: "equipment",
                                element: <Equipment />,
                            },
                            {
                                path: "product",
                                element: <Product />,
                            },
                            {
                                path: "product-trans",
                                element: <ProductTrans />,
                            },
                            {
                                path: "vehicle",
                                element: <Vehicle />,
                            },
                        ],
                    },
                    {
                        path: "screen",
                        element: <Screen />,
                        children: [
                            {
                                path: "alarm",
                                element: <Alarm />,
                            },
                            {
                                path: "equipment-stats",
                                element: <EquipmentStats />,
                            },
                            {
                                path: "map",
                                element: <Map />,
                            },
                        ],
                    },
                ],
            },
        ],
    },
]

const router = createBrowserRouter(routes)
export default router
