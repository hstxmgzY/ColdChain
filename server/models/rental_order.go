package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type RentalOrder struct {
	gorm.Model
	ID           uint           `gorm:"primaryKey" json:"id"`
	OrderNumber  string         `gorm:"size:24;unique;not null" json:"order_number"`
	UserID       uint           `gorm:"not null" json:"user_id"`
	StatusID     uint           `gorm:"foreignKey:StatusID;not null" json:"status_id"`
	TotalPrice   float64        `gorm:"type:decimal(12,2);not null" json:"total_price"`
	SenderInfo   datatypes.JSON `gorm:"type:json;not null" json:"sender_info"`
	ReceiverInfo datatypes.JSON `gorm:"type:json;not null" json:"receiver_info"`
	OrderNote    string         `gorm:"size:255;" json:"order_note"`
}
