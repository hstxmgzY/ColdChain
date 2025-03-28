package models

import "gorm.io/gorm"

type Category struct {
	gorm.Model
	ID           uint   `gorm:"primaryKey" json:"id"`
	CategoryName string `gorm:"size:50;not null;unique" json:"category_name"`
}

type Product struct {
	gorm.Model
	ID          uint        `gorm:"primaryKey" json:"id"`
	ProductName string      `gorm:"size:100;not null" json:"product_name"`
	CategoryID  uint        `gorm:"foreignKey:CategoryID;not null" json:"category_id"`
	SpecWeight  float64     `gorm:"type:decimal(10,2);" json:"spec_weight"`
	SpecVolume  float64     `gorm:"type:decimal(10,2);" json:"spec_volume"`
	ImageURL    string      `gorm:"size:255;" json:"image_url"`
	OrderItems  []OrderItem `gorm:"foreignKey:ProductID" json:"order_items"`
	Category    Category    `gorm:"foreignKey:CategoryID" json:"category"`
	CreatedAt   string      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt   string      `gorm:"autoUpdateTime" json:"updated_at"`
}
