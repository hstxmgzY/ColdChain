import { ProductType } from "./product"

export interface OrderItemType {
    id: number // 主键
    quantity: number // 数量
    unit_price: number // 单价
    product: ProductType // 产品
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
        user_name: string // 用户名
        role_name: string // 角色名称
    }
    order_items: OrderItemType[] // 订单项
}




