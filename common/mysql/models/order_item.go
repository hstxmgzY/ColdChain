package models

import (
	"gorm.io/gorm"
)

type OrderItem struct {
	gorm.Model
	ID        uint     `gorm:"primaryKey" json:"id"`
	OrderID   uint     `gorm:"foreignKey:OrderID;not null" json:"order_id"`
	ProductID uint     `gorm:"foreignKey:ProductID;not null" json:"product_id"`
	Quantity  int      `gorm:"default:1" json:"quantity"`
	UnitPrice float64  `gorm:"type:decimal(10,2);not null" json:"unit_price"`
	Product   Product  `gorm:"foreignKey:ProductID" json:"product"`
	Modules   []Module `json:"modules"`
}

