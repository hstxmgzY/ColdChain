package dto

type DeviceStatus struct {
	DeviceID     string  `ch:"device_id" json:"device_id"`
	Temperature  float32 `ch:"temperature" json:"temperature"`
	BatteryLevel float32 `ch:"battery_level" json:"battery_level"`
}
