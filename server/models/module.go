package models

import (
	"gorm.io/gorm"
)

// 设备状态枚举
type ModuleStatus string

const (
	StatusActive   ModuleStatus = "active"   // 设备启动
	StatusInactive ModuleStatus = "inactive" // 设备未使用
	StatusFaulty   ModuleStatus = "faulty"   // 设备故障
)

type Module struct {
	gorm.Model
	ID             uint         `gorm:"primaryKey" json:"id"`
	DeviceID       string       `gorm:"size:255;unique" json:"device_id"`                        // 设备物理ID
	MinTemperature float64      `gorm:"type:decimal(5,1)" json:"min_temperature"`                // 最低温度阈值
	MaxTemperature float64      `gorm:"type:decimal(5,1)" json:"max_temperature"`                // 最高温度阈值
	Status         ModuleStatus `gorm:"type:enum('active', 'inactive', 'faulty')" json:"status"` // 设备状态 (枚举)
	IsEnabled      bool         `gorm:"default:true" json:"is_enabled"`                          // 是否启用
	Volume         float64      `gorm:"type:decimal(10,3)" json:"volume"`                        // 容量(m³)
	ProductID      uint         `gorm:"foreignKey:ProductID" json:"product_id"`                  // 关联产品表 (外键)
}
