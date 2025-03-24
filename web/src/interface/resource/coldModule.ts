import { ProductType } from "../order/product"

export interface ColdModuleType {
    id: string  //冷链箱编号
    device_id: string // 设备物理ID
    minTemperature: number // 可设置最低温度
    maxTemperature: number // 可设置最高温度
    temperature: number // 当前温度
    battery: number // 电池电量
    workingTime: number // 工作时间
    status: "待分配" | "已分配" // 未被租用/被租用
    isEnabled: boolean // 是否开启
    volume: number // 体积 (m³)
    leaseId: number // 订单编号
    product?: ProductType
}
