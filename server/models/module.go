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
	DeviceID           string       `gorm:"size:255;unique" json:"device_id"`                            // 设备物理ID
	SettingTemperature float64      `gorm:"type:decimal(5,1)" json:"setting_temperature"`                // 设定温度值
	Status             ModuleStatus `gorm:"type:enum('assigned', 'unassigned', 'faulty')" json:"status"` // 设备状态 (枚举)
	IsEnabled          bool         `gorm:"default:true" json:"is_enabled"`                              // 是否启用
	OrderItemID        uint         `gorm:"foreignKey:OrderItemID" json:"order_item_id"`                 // 关联的订单项ID
}

// BeforeCreate 钩子函数，在创建 Module 之前执行
func (m *Module) BeforeCreate(tx *gorm.DB) (err error) {
	if m.OrderItemID == 0 {
		return nil
	}

	// 获取关联的订单项
	var orderItem OrderItem
	if err := tx.First(&orderItem, m.OrderItemID).Error; err != nil {
		return err
	}

	// 获取关联的产品信息
	var product Product
	if err := tx.First(&product, orderItem.ProductID).Error; err != nil {
		return err
	}

	// 计算产品的设定温度 (MaxTemperature + MinTemperature) / 2
	m.SettingTemperature = (product.MaxTemperature + product.MinTemperature) / 2
	return nil
}
