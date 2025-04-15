package main

import (
	"coldchain/common/kafka"
	"coldchain/common/logger"
	"coldchain/common/mysql"
	"coldchain/server/dao"
	"math/rand"
	"os"
	"strconv"
	"sync"
	"time"
)

func initKafka() {
	// Initialize Kafka producers and consumers here
	admin, err := kafka.NewAdmin(KAFKA_BROKERS)
	if err != nil {
		logger.Fatalf("Failed to create Kafka admin: %v", err)
	}
	defer admin.Close()

	isExist, err := admin.Exists("device")
	if err != nil {
		logger.Fatalf("Failed to check if topic device exists: %v", err)
	}
	retentionMs := "60000" // 7 days in milliseconds
	if !isExist {
		// Create topics for sink kafka if they don't exist
		err = admin.CreateTopicWithConfig("device", map[string]*string{
			"retention.ms": &retentionMs,
		}, 3, 1)
		if err != nil {
			logger.Fatalf("Failed to create topic device_temperature: %v", err)
		}
	} else {
		// Update topic configuration if it exists
		err = admin.UpdateTopic("device", map[string]*string{
			"retention.ms": &retentionMs,
		})
		if err != nil {
			logger.Fatalf("Failed to update topic device_temperature: %v", err)
		}
	}

	logger.Infof("Kafka init successfully")
}

func main() {
	// 初始化配置
	ImportConfig()
	mysql.InitDB()
	logger.SetOutput(os.Stdout)
	initKafka()

	moduleRepo := dao.NewModuleRepository(mysql.Db)
	devices := make(map[string]*Device)
	var modulesMut sync.Mutex
	producer, err := kafka.NewProducer(KAFKA_BROKERS, "device")
	if err != nil {
		panic(err)
	}
	defer producer.Close()

	go func() {
		// 每10秒钟检查一次数据库，获取最新的模块列表
		// 如果有新的模块，则添加到设备列表中
		ticker := time.NewTicker(time.Second * 10)
		defer ticker.Stop()
		for range ticker.C {
			modules, err := moduleRepo.ListModules()
			if err != nil {
				panic(err)
			}
			modulesMut.Lock()
			for _, module := range modules {
				if module.IsEnabled == false {
					continue
				}
				if _, ok := devices[module.DeviceID]; !ok {
					device := &Device{
						DeviceID:       module.DeviceID,
						CurTemperature: 0,
						SetTemperature: module.SettingTemperature,
						BatteryLevel:   100,
						IsDamaged:      false,
					}
					devices[module.DeviceID] = device
					logger.Infof("添加设备: %s", module.DeviceID)
				}
			}
			modulesMut.Unlock()
		}
	}()

	tricker := time.NewTicker(time.Second / time.Duration(GENERSTION_RATE))
	for range tricker.C {
		modulesMut.Lock()
		for _, device := range devices {
			device.CurTemperature = device.SetTemperature + (rand.Float64()-0.5)*2
			partition, offset, err := producer.SendMessage(device.DeviceID, strconv.FormatFloat(device.CurTemperature, 'f', 2, 64)+" "+strconv.FormatFloat(device.BatteryLevel, 'f', 2, 64))
			if err != nil {
				logger.Errorf("发送数据失败: %v", err)
			} else {
				logger.Infof("发送数据成功: %s, partition: %d, offset: %d", device.DeviceID, partition, offset)
			}

			// 更新设备状态
			device.UpdateStat()
		}
		modulesMut.Unlock()
	}
}
