package models

import "gorm.io/gorm"

type ProductCategory struct {
	gorm.Model
	ID           uint   `gorm:"primaryKey" json:"id"`
	CategoryName string `gorm:"size:50;not null;unique" json:"category_name"`
}
