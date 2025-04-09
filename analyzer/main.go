package main

import (
	"coldchain/common/clickhouse"
	"coldchain/common/kafka"
	"coldchain/common/logger"
	"coldchain/common/mysql"
	"coldchain/common/redis"
	"context"
	"fmt"
	"os"
	"time"
)

func initKafka() {
	// Initialize Kafka producers and consumers here
	admin, err := kafka.NewAdmin(SINK_BROKERS)
	if err != nil {
		logger.Fatalf("Failed to create Kafka admin: %v", err)
	}
	defer admin.Close()

	isExists, err := admin.Exists("device")
	if err != nil {
		logger.Fatalf("Failed to check if topic device exists: %v", err)
	}
	retentionMs := "60000" // 1 minute in milliseconds
	if !isExists {
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

const (
	InsertAlarmRecordSQL = `INSERT INTO 
								alarm_record (time_stamp, device_id, alarm_level, alarm_description, alarm_status) 
							VALUES (now(), ?, ?, ?, ?)`

	InsertDeviceRecordSQL = `INSERT INTO
								module_monitor (time_stamp, device_id, temperature, battery_level)
							VALUES (now(), ?, ?, ?)`
)

func main() {
	logger.SetOutput(os.Stdout)
	importConfig()
	mysql.InitDB()
	redis.InitDB()
	clickhouse.InitDB()
	initKafka()

	history := NewHistoryStorage(redis.GetInstance(), mysql.GetInstance())
	ch := clickhouse.GetInstance()

	NewAnalyzer(SOURCE_BROKERS, SINK_BROKERS, "device").
		SetAnalysisFunc(func(deviceID string, msg string) error {
			device, err := history.GetDeviceData(deviceID)
			if err != nil {
				return err
			}
			var CurTemperature, CurBattery float64
			fmt.Sscanf(msg, "%f %f", &CurTemperature, &CurBattery)
			logger.Debugf("Device %s temperature: %f, battery: %f", deviceID, CurTemperature, CurBattery)

			if CurTemperature > device.MaxTemperature || CurTemperature < device.MinTemperature {
				// 发送温度超限告警
				logger.Warnf("Device %s current temperature is %f , out of range [%f, %f]", deviceID, CurTemperature, device.MinTemperature,device.MaxTemperature)
				if err := ch.AsyncInsert(context.Background(), InsertAlarmRecordSQL,
					false, deviceID, "HIGH", fmt.Sprintf("Current temperature is %f , out of range [%f, %f]", CurTemperature, device.MinTemperature, device.MaxTemperature), "未读"); err != nil {
					logger.Errorf("Failed to insert alarm record: %v", err)
				}
			}

			if CurBattery < 10 {
				// 发送低电告警
				logger.Warnf("Device %s battery too low: %f", deviceID, CurBattery)
				if err := ch.AsyncInsert(context.Background(), InsertAlarmRecordSQL,
					false, deviceID, "HIGH", "Battery is too low", "未读"); err != nil {
					logger.Errorf("Failed to insert alarm record: %v", err)
				}
			}

			if err := ch.AsyncInsert(context.Background(), InsertDeviceRecordSQL,
				false, deviceID, CurTemperature, CurBattery); err != nil {
				logger.Errorf("Failed to insert device record: %v", err)
			}

			return nil
		}).Start()

	logger.Infof("Analyzer started")
	tricker := time.NewTicker(time.Second * 1)
	defer tricker.Stop()
	for range tricker.C {
		// do nothing
	}
}
