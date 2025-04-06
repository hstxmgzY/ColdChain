import { UserInfo } from "../user/user"

export interface Product {
    product_name: string
    category_name: string
    max_temperature: number
    min_temperature: number
    spec_weight: number
    spec_volume: number
    image_url: string
}

export interface OrderItem {
    quantity: number // 数量
    //   unit_price: number // 单价
    product: Product // 产品
    module?: ModuleInfoType[] // 模块信息
}

export interface ModuleInfoType {
    id: number // 主键
    device_id: string // 设备物理ID
    settingTemperature: number // 设置温度
    status: "assigned" | "unassigned" | "faulty" // 未被租用/被租用/故障
    isEnabled: boolean // 是否开启
}

export interface ContactInfo {
    name: string
    phone: string
    detail: string
}

export interface Order {
    // id: number // 主键
    // order_number: string // 订单编号
    // total_price: number // 总价
    // status_name: string // 订单状态名称
    sender_info: ContactInfo | null // 发件人信息
    receiver_info: ContactInfo | null // 收件人信息
    delivery_date: string | null
    order_note: string // 订单备注
    user: UserInfo // 用户信息
    order_items: OrderItem[] // 订单项
}
