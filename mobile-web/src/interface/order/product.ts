export interface ProductType {
    id: number // 产品ID
    product_name: string // 产品名称
    category_name: string
    min_temperature: number // 最低温度 (°C)
    max_temperature: number // 最高温度 (°C)
    spec_weight: number // 产品重量 (kg)
    spec_volume: number // 体积 (m³)
    image_url: string // 产品图片
}
