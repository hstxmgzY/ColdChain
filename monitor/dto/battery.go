package dto

type Battery struct {
	DeviceID string  `json:"device_id"`
	Current  float64 `json:"current"`
}
