package models

import (
	"gorm.io/gorm"
)

// 设备状态枚举
type ModuleStatus string

const (
	StatusAssigned   ModuleStatus = "assigned"   // 设备分配
	StatusUnassigned ModuleStatus = "unassigned" // 设备未分配
	StatusFaulty     ModuleStatus = "faulty"     // 设备故障
)

type Module struct {
	gorm.Model
	ID                 uint         `gorm:"primaryKey" json:"id"`
	DeviceID           string       `gorm:"size:255;unique" json:"device_id"`                          // 设备物理ID
	SettingTemperature float64      `gorm:"type:decimal(5,1)" json:"setting_temperature"`              // 设定温度值
	MaxTemperature     float64      `gorm:"type:decimal(5,1)" json:"max_temperature"`                  // 最高温度值
	MinTemperature     float64      `gorm:"type:decimal(5,1)" json:"min_temperature"`                  // 最低温度值
	Status             ModuleStatus `gorm:"type:enum('assigned','unassigned','faulty')" json:"status"` // 设备状态 (枚举)
	IsEnabled          bool         `gorm:"default:false" json:"is_enabled"`                           // 是否启用
	OrderItemID        *uint        `json:"order_item_id"`                                             // 关联的订单项ID
}
