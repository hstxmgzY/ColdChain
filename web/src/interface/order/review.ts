import { ColdModuleType } from "../resource/coldModule"

export interface ReviewOrderType {
    id: number // 主键
    order_number: string // 订单编号
    priority: "紧急" | "标准" // 订单紧急度
    userType: "merchant" | "individual" // 用户类型
    companyName?: string // 商户名称（仅商户用户有）
    userName?: string // 个人用户名称（仅个人用户有）
    // licenseUrl?: string // 营业执照图片URL（仅商户用户有）
    // productType: "medical" | "fresh" | "general" // 物流产品类型
    coldModules: ColdModuleType[] // 多冷链箱数组
    coldModuleCount: number // 租赁冷链箱个数
    // productName: string // 产品名称
    // productWeight: number // 产品重量（kg）
    route: string[] // 配送路线 ["起点", "终点"]
    status: "pending" | "approved" | "rejected" // 订单审核状态
}


