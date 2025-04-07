package main

import (
	"coldchain/common/kafka"
	"coldchain/common/logger"
	"coldchain/server/dao"
	"coldchain/server/mysql"
	"math/rand"
	"os"
	"strconv"
	"sync"
	"time"
)

func main() {
	// 初始化配置
	ImportConfig()
	mysql.InitDB()
	logger.SetOutput(os.Stdout)

	moduleRepo := dao.NewModuleRepository(mysql.Db)
	devices := make(map[string]*Device)
	var modulesMut sync.Mutex
	temperatureProducer, err := kafka.NewKafkaProducer(KAFKA_BROKERS, "device_temperature")
	if err != nil {
		panic(err)
	}
	defer temperatureProducer.Close()

	batteryProducer, err := kafka.NewKafkaProducer(KAFKA_BROKERS, "device_battery")
	if err != nil {
		panic(err)
	}
	defer batteryProducer.Close()

	go func() {
		// 每10秒钟检查一次数据库，获取最新的模块列表
		// 如果有新的模块，则添加到设备列表中
		ticker := time.NewTicker(time.Second * 1)
		defer ticker.Stop()
		for range ticker.C {
			modules, err := moduleRepo.ListModules()
			if err != nil {
				panic(err)
			}
			modulesMut.Lock()
			for _, module := range modules {
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

	for {
		modulesMut.Lock()
		for _, device := range devices {
			// 生成温度数据
			device.CurTemperature = device.SetTemperature + (rand.Float64()-0.5)*2
			partition, offset, err := temperatureProducer.SendMessage(device.DeviceID + " " + strconv.FormatFloat(device.CurTemperature, 'f', 2, 64))
			if err != nil {
				logger.Errorf("发送温度数据失败: %v", err)
			} else {
				logger.Infof("发送温度数据成功: %s, partition: %d, offset: %d", device.DeviceID, partition, offset)
			}

			// 生成电池数据
			device.BatteryLevel -= BATTERY_CONSUMPTION_RATE
			if device.BatteryLevel < 0 {
				device.BatteryLevel = 0
			}
			partition, offset, err = batteryProducer.SendMessage(device.DeviceID + " " + strconv.FormatFloat(device.BatteryLevel, 'f', 2, 64))
			if err != nil {
				logger.Errorf("发送电池数据失败: %v", err)
			} else {
				logger.Infof("发送电池数据成功: %s, partition: %d, offset: %d", device.DeviceID, partition, offset)
			}

			// 生成设备损坏数据
			// 如果设备没有损坏，且当前温度不等于设定温度，则进行温度调整
			// 如果设备损坏，则温度上升
			if !device.IsDamaged && device.CurTemperature != device.SetTemperature {
				if device.CurTemperature > device.SetTemperature {
					device.CurTemperature -= 0.1
				} else {
					device.CurTemperature += 0.1
				}
			}

			if !device.IsDamaged {
				if rand.Float64() < DEVICE_DAMAGED_RATIO {
					device.IsDamaged = true
				} else {
					device.IsDamaged = false
				}
			} else {
				device.CurTemperature += 0.2
			}
		}
		modulesMut.Unlock()

		// 休眠一段时间，控制生成速度
		time.Sleep(time.Second / time.Duration(GENERSTION_RATE))
	}
}
