export interface LeaseType {
    id: number // 主键
    order_number: string // 订单编号
    status: "待支付" | "已支付" | "已审核" | "已发货" | "已完成" | "已取消"
    price: number // 价格
    create_time: string // 创建时间
    delivery_time: string // 取货时间
    finish_time: string // 完成时间
    sender_address: string // 发货地址
    sender_name: string // 寄件人姓名
    sender_phone: string // 寄件人电话
    receiver_address: string // 收货地址
    receiver_name: string // 收货人姓名
    receiver_phone: string // 收货人电话
    order_note: string // 订单备注
}
