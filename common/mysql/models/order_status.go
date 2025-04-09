package models

import "gorm.io/gorm"

type OrderStatus struct {
	gorm.Model
	ID         uint   `gorm:"primaryKey" json:"id"`
	StatusName string `gorm:"size:20;not null" json:"status_name"`
	IsActive   bool   `gorm:"default:true" json:"is_active"`
}
