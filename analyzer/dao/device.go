package dao

import (
	"coldchain/common/mysql/models"

	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

type DeviceRepository struct {
	db    *gorm.DB
	cache *redis.Client
}

func NewDeviceRepository(db *gorm.DB) *DeviceRepository {
	return &DeviceRepository{db: db}
}

func (dr *DeviceRepository) GetDeviceByID(deviceID string) (*models.Module, error) {
	var device models.Module
	err := dr.db.Where("device_id = ?", deviceID).Find(&device).Error
	if err != nil {
		return nil, err
	}

	return &device, nil
}
