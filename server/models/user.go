package models
import (
	"gorm.io/datatypes"
	"time"
)

type UserRole struct {
	ID 	 uint   `gorm:"primaryKey" json:"id"`
	RoleName string `gorm:"type:varchar(50);not null" json:"role_name"`
}

type User struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Username  string    `gorm:"type:varchar(50);not null" json:"username"`
	Phone	 string    `gorm:"type:varchar(50);unique" json:"phone"`
	PasswordHash  string   `gorm:"type:CHAR(60);not null" json:"password_hash"`
	RoleID   uint      `gorm:"not null" json:"role_id"`
	Role    UserRole  `gorm:"foreignKey:RoleID;references:ID"`
	Address datatypes.JSON `gorm:"type:json" json:"address"`
	CreatedAt time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt time.Time `gorm:"autoUpdateTime" json:"updated_at"`
}

