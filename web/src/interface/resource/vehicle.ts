export default interface VehicleType {
    id: number
    cardNumber: string // 车牌号
    status: "空闲" | "使用中" | "维修中" // 车辆状态
    type: string // 车辆类型
    GPS: string // GPS 位置
    carryingNumber: number // 承载冷链箱个数
    availableCarryingNumber: number // 可用冷链箱个数
    carryingWeight: number // 承载重量 (kg)
    carryingVolume: number // 承载体积 (m³)
    imgUrl: string // 车辆图片
}
