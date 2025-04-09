package main

import (
	"coldchain/analyzer/dao"
	"coldchain/common/logger"
	"context"
	"encoding/json"

	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

type HistoryStorage struct {
	cache *redis.Client

	deviceRepo *dao.DeviceRepository
}

type Device struct {
	DeviceID       string  `json:"device_id"`
	MaxTemperature float64 `json:"max_temperature"`
	MinTemperature float64 `json:"min_temperature"`
}

func NewHistoryStorage(cache *redis.Client, db *gorm.DB) *HistoryStorage {
	return &HistoryStorage{
		cache:      cache,
		deviceRepo: dao.NewDeviceRepository(db),
	}
}

func (hs *HistoryStorage) GetDeviceData(deviceID string) (*Device, error) {
	if hs.cache != nil {
		res := hs.cache.Get(context.Background(), deviceID)
		if hs.cache != nil && res.Err() == nil {
			logger.Infof("Cache hit for device %s", deviceID)
			s := res.Val()
			var d Device
			err := json.Unmarshal([]byte(s), &d)
			if err != nil {
				return nil, err
			}

			return &d, nil
		}
	}
	device, err := hs.deviceRepo.GetDeviceByID(deviceID)
	if err != nil {
		return nil, err
	}

	d := &Device{
		DeviceID:       device.DeviceID,
		MaxTemperature: device.MaxTemperature,
		MinTemperature: device.MinTemperature,
	}
	s, err := json.Marshal(d)
	if err != nil {
		return nil, err
	}

	if hs.cache != nil {
		if err := hs.cache.Set(context.Background(), deviceID, s, 0).Err(); err != nil {
			return nil, err
		}
	}
	return d, nil
}
