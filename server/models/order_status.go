package models

import "gorm.io/gorm"

type OrderStatus struct {
	gorm.Model
	StatusID   uint   `gorm:"primaryKey;autoIncrement:false" json:"status_id"`
	StatusName string `gorm:"size:20;not null" json:"status_name"`
	IsActive   bool   `gorm:"default:true" json:"is_active"`
}
