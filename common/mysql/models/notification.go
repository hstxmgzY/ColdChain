package models

import "gorm.io/gorm"

type Notification struct {
	gorm.Model
	ID      uint   `gorm:"primaryKey" json:"id"`
	Type    string `gorm:"type:enum('reject', 'notice')" json:"type"` // 通知类型 (枚举)
	Title   string `gorm:"type:varchar(255);not null" json:"title"`   // 通知标题
	Content string `gorm:"type:text;not null" json:"content"`         // 通知内容
	IsRead  bool   `gorm:"default:false" json:"is_read"`              // 是否已读
}

type NotificationUser struct {
	ID             uint `gorm:"primaryKey;autoIncrement" json:"id"`
	NotificationID uint `gorm:"not null;foreignKey:NotificationID" json:"notification_id"` // 通知ID
	UserID         uint `gorm:"not null;foreignKey:UserID" json:"user_id"`                 // 用户ID
}
