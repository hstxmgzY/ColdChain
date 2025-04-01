export interface ProductType {
    id: number // 产品ID
    productName: string // 产品名称
    categoryName: string
    minTemperature: number // 最低温度 (°C)
    maxTemperature: number // 最高温度 (°C)
    specWeight: number // 产品重量 (kg)
    specVolume: number // 体积 (m³)
    imageUrl: string // 产品图片
}
