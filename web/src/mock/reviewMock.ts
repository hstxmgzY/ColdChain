// src/mock/index.ts
import Mock from "mockjs"
import { ReviewOrderType } from "../interface/order/review"
import { ColdModuleType } from "../interface/resource/coldModule"
import { ProductType } from "../interface/order/product"

Mock.setup({ timeout: "500-1000" }) // 模拟网络延迟 500~1000ms

// 生成单个产品
const createMockProduct = (): ProductType =>
    Mock.mock({
        id: "@guid",
        productName: "@word(5, 10)",
        category: "@pick(['医药', '生鲜', '其他'])",
        "weight|1-10.1-2": 1,
        volume: () => Mock.Random.float(0.1, 2, 1, 2),
    })

// 生成多个冷链箱（每次调用都返回独立数组）
const createMockColdModules = (): ColdModuleType[] =>
    Mock.mock({
        "list|1-5": [
            {
                id: "@guid",
                "minTemperature|-20-5": 1,
                "maxTemperature|5-20": 1,
                status: "@pick(['待分配', '已分配'])",
                isEnabled: "@boolean",
                volume: () => Mock.Random.float(0.1, 2, 1, 2),
                product: () => createMockProduct(), // 每个冷链箱都包含不同的产品
            },
        ],
    }).list

// 生成订单数据（每个订单都有多个冷链箱）
const mockOrders: ReviewOrderType[] = Mock.mock({
    "data|10-20": [
        {
            id: "@guid",
            order_number: "@string('number', 12)",
            "priority|1": ["紧急", "标准"],
            "userType|1": ["merchant", "individual"],
            companyName: "@cword(3,5)公司",
            userName: "@cname",
            coldModules: () => createMockColdModules(), // 订单包含多个冷链箱
            coldModuleCount: function () {
                return this.coldModules.length
            },
            route: ["@city", "@city"],
            "status|1": ["pending", "approved", "rejected"],
        },
    ],
}).data

// Mock API：获取审核订单列表
Mock.mock(/\/api\/order\/review\/list/, "get", (options) => {
    const urlParams = new URLSearchParams(options.url.split("?")[1])
    const status = urlParams.get("status")

    const filteredOrders = status ? mockOrders.filter((order) => order.status === status) : mockOrders

    return {
        code: 200,
        message: "Success",
        data: filteredOrders,
    }
})

// export default Mock
