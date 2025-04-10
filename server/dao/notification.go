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

func (r *NotificationRepository) CreateNotification(notification *models.Notification) error {
	return r.db.Create(notification).Error
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

func (r *NotificationRepository) GetNotificationByUserID(userID uint) ([]models.Notification, error) {
	var notifications []models.Notification
	if err := r.db.Where("user_id = ?", userID).Find(&notifications).Error; err != nil {
		return nil, err
	}
	return notifications, nil
}
