package dao

import (
	"coldchain/common/mysql/models"

	"gorm.io/gorm"
)

type NotificationRepository struct {
	db *gorm.DB
}

func NewNotificationRepository(db *gorm.DB) *NotificationRepository {
	return &NotificationRepository{db: db}
}

func (r *NotificationRepository) Transaction(fn func(db *gorm.DB) error) error {
	tx := r.db.Begin()
	if err := fn(tx); err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit().Error
}

func (r *NotificationRepository) GetNotificationByID(notificationID uint) (*models.Notification, error) {
	var notification models.Notification
	if err := r.db.First(&notification, notificationID).Error; err != nil {
		return nil, err
	}
	return &notification, nil
}

func (r *NotificationRepository) ListNotifications() ([]models.Notification, error) {
	var notifications []models.Notification
	if err := r.db.Find(&notifications).Error; err != nil {
		return nil, err
	}
	return notifications, nil
}

func (r *NotificationRepository) GetNotificationByUserID(userID int) ([]models.Notification, error) {
	var notifications []models.Notification
	if err := r.db.Joins("JOIN notification_users ON notification_users.notification_id = notifications.id").Where("notification_users.user_id = ?", userID).Error; err != nil {
		return nil, err
	}
	return notifications, nil
}
