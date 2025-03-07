import { ProductType } from "../order/product"

export interface ColdModuleType {
    id: string
    minTemperature: number // 最低温度
    maxTemperature: number // 最高温度
    status: "待分配" | "已分配" // 未被租用/被租用
    isEnabled: boolean // 是否开启
    volume: number // 体积 (m³)
    product?:ProductType
}
