package models

import (

	"gorm.io/gorm"
)

// 车辆状态类型
type VehicleStatus string

const (
	StatusIdle     VehicleStatus = "空闲"
	StatusInUse    VehicleStatus = "使用中"
	StatusMaintain VehicleStatus = "维修中"
	StatusDisabled VehicleStatus = "停用"
)

// 车辆表结构
type Vehicle struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	PlateNumber    string         `gorm:"type:varchar(20);uniqueIndex;not null" json:"plate_number"`
	Status         VehicleStatus  `gorm:"type:varchar(20);not null" json:"status"`
	MaxCapacity int            `gorm:"not null" json:"max_capacity"`
	ImgUrl         string         `gorm:"type:varchar(255)" json:"img_url"`
	// CreatedAt      time.Time      `json:"created_at"`
	// UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

// TableName 显式指定表名
func (Vehicle) TableName() string {
	return "vehicles"
}

// MigrateDB 迁移数据库
func MigrateDB(db *gorm.DB) {
	db.AutoMigrate(&Vehicle{})
}
