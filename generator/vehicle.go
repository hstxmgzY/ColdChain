package main

type Vehicle struct {
	VehicleID string  `json:"vehicle_id"`
	Longitude float64 `json:"longitude"`
	Latitude  float64 `json:"latitude"`
	Speed     float64 `json:"speed"`
}

func (v *Vehicle) UpdateLocation() {
	// 更新车辆位置
	// 这里可以调用地图API或者其他服务来获取最新位置
	// 假设我们使用随机数来模拟位置更新
	v.Longitude += 0.01
	v.Latitude += 0.01
}
