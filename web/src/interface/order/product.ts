export interface ProductType {
    id: number // 产品ID
    productName: string // 产品名称
    category: "medical" | "fresh" | "general" // 产品类别 ("医药", "生鲜", "普货")
    weight: number // 产品重量 (kg)
    volume: number // 体积 (m³)
}
