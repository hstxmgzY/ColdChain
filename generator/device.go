package main

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

type SetTemperatureRequest struct {
	Temperature float64 `json:"temperature"`
	DeviceID    string  `json:"device_id"`
}

type AddDeviceRequest struct {
	DeviceID       string  `json:"device_id"`
	CurTemperature float64 `json:"temperature"`
}
