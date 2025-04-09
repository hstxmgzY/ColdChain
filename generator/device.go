package main

import "math/rand"

type Device struct {
	DeviceID       string  `json:"device_id"`
	CurTemperature float64 `json:"temperature"`
	SetTemperature float64
	BatteryLevel   float64 `json:"battery_level"`

	// 所属车辆ID
	// 之后设备的位置应与车辆相同
	// VehicleID string  `json:"vehicle_id"`
	// Longitude float64 `json:"longitude"`
	// Latitude  float64 `json:"latitude"`

	IsDamaged bool
}

func (d *Device) UpdateStat() {
	// 更新设备状态
	// 这里可以添加一些逻辑来更新设备的状态

	// 生成电池电量数据
	d.BatteryLevel -= BATTERY_CONSUMPTION_RATE
	if d.BatteryLevel < 0 {
		d.BatteryLevel = 0
	}

	// 生成设备损坏数据
	// 如果设备没有损坏，且当前温度不等于设定温度，则进行温度调整
	// 如果设备损坏，则温度上升
	if !d.IsDamaged && d.CurTemperature != d.SetTemperature {
		if d.CurTemperature > d.SetTemperature {
			d.CurTemperature -= 0.1
		} else {
			d.CurTemperature += 0.1
		}
	}

	if !d.IsDamaged {
		if rand.Float64() < DEVICE_DAMAGED_RATIO {
			d.IsDamaged = true
		} else {
			d.IsDamaged = false
		}
	} else {
		d.CurTemperature += 0.2
	}
}

type SetTemperatureRequest struct {
	Temperature float64 `json:"temperature"`
	DeviceID    string  `json:"device_id"`
}

type AddDeviceRequest struct {
	DeviceID       string  `json:"device_id"`
	CurTemperature float64 `json:"temperature"`
}
