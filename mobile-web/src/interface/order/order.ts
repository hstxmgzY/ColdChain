import { ProductType } from "./product"

export interface OrderItemType {
    id: number // 主键
    quantity: number // 数量
    unit_price: number // 单价
    product: ProductType // 产品
    module?: ModuleInfoType[] // 模块信息
}

export interface ModuleInfoType {
    id: number // 主键
    device_id: string // 设备物理ID
    settingTemperature: number // 设置温度
    status: "assigned" | "unassigned" | "faulty" // 未被租用/被租用/故障
    isEnabled: boolean // 是否开启
}

export interface OrderType {
    id: number // 主键
    order_number: string // 订单编号
    total_price: number // 总价
    status_name: string // 订单状态名称
    sender_info: {
        name: string // 姓名
        phone: string // 电话
        detail: string // 地址
    }
    receiver_info: {
        name: string // 姓名
        phone: string // 电话
        detail: string // 地址
    }
    order_note: string // 订单备注
    user: {
        username: string // 用户名
        role_name: string // 角色名称
    }
    order_items: OrderItemType[] // 订单项
}
