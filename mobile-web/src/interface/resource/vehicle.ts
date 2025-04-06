export default interface VehicleType {
    id: number
    plateNumber: string // 车牌号
    status: "空闲" | "使用中" | "维修中" | "停用" // 车辆状态
    // GPS: string // GPS 位置
    MaxCapacity: number // 最多可承载冷链箱个数
    imgUrl: string // 车辆图片
}
