package models

import (
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type UserRole struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	RoleName string `gorm:"type:varchar(50);not null" json:"role_name"`
}

type User struct {
	gorm.Model
	ID           uint           `gorm:"primaryKey" json:"id"`
	Username     string         `gorm:"type:varchar(50);not null" json:"username"`
	Phone        string         `gorm:"type:varchar(50);unique" json:"phone"`
	PasswordHash string         `gorm:"type:CHAR(60);not null" json:"password_hash"`
	RoleID       uint           `gorm:"type:int;not null" json:"role_id"`
	Role         UserRole       `gorm:"foreignKey:RoleID;references:ID"`
	Address      datatypes.JSON `gorm:"type:json" json:"address"`
	RentalOrders []RentalOrder  `gorm:"foreignKey:UserID" json:"rental_orders"`
}
