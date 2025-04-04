import Main from "../pages/main"
import Home from "../pages/home"
import { createBrowserRouter, Navigate } from "react-router-dom"
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

const routes = [
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        path: "/",
        element: <Main />,
        children: [
            // 重定向
            {
                path: "/",
                element: <Navigate to="/home" />,
            },
            {
                path: "home",
                element: <Home />,
            },
            {
                path: "user",
                element: <User />,
            },
            {
                path: "order",
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
                    {
                        path: "login",
                        element: <LoginPage />,
                    },
                ],
            },
            {
                path: "resource",
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
                    {
                        path: "login",
                        element: <LoginPage />,
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
                    {
                        path: "login",
                        element: <LoginPage />,
                    },
                ],
            },
            {
                path: "login",
                element: <LoginPage />,
            },
        ],
    },
    {
        path: "/login",
        element: <LoginPage />,
    },
]

const router = createBrowserRouter(routes)
export default router
