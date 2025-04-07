package main

import (
	"github.com/spf13/viper"

	_ "coldchain/common/config"
)

var (
	DEVICE_NUMBER            = 1000
	DEVICE_ID_PREFIX         = "device_"
	GENERSTION_RATE          = 1000  // 1000/s
	BATTERY_CONSUMPTION_RATE = 0.001 // 0.1% per second

	VEHICLE_NUMBER    = 1000
	VEHICLE_ID_PREFIX = "vehicle_"

	DEVICE_DAMAGED_RATIO = 0.0001 // 0.01%

	GEN_IP   = "0.0.0.0"
	GEN_PORT = "5678"

	MYSQL_HOST    = "localhost"
	MYSQL_PORT    = "3306"
	KAFKA_BROKERS = []string{"localhost:9092"}
)

func ImportConfig() {
	if viper.IsSet("generator.device_number") {
		DEVICE_NUMBER = viper.GetInt("device_number")
	}
	if viper.IsSet("generator.device_id_prefix") {
		DEVICE_ID_PREFIX = viper.GetString("device_id_prefix")
	}
	if viper.IsSet("generator.generstion_rate") {
		GENERSTION_RATE = viper.GetInt("generator.generstion_rate")
	}
	if viper.IsSet("generator.battery_consumption_rate") {
		BATTERY_CONSUMPTION_RATE = viper.GetFloat64("battery_consumption_rate")
	}
	if viper.IsSet("generator.vehicle_number") {
		VEHICLE_NUMBER = viper.GetInt("vehicle_number")
	}
	if viper.IsSet("generator.device_damaged_ratio") {
		DEVICE_DAMAGED_RATIO = viper.GetFloat64("device_damaged_ratio")
	}
	if viper.IsSet("generator.gen_ip") {
		GEN_IP = viper.GetString("gen_ip")
	}
	if viper.IsSet("generator.gen_port") {
		GEN_PORT = viper.GetString("gen_port")
	}
	if viper.IsSet("generator.mysql.host") {
		MYSQL_HOST = viper.GetString("mysql.host")
	}
	if viper.IsSet("generator.mysql.port") {
		MYSQL_PORT = viper.GetString("mysql.port")
	}
	if viper.IsSet("generator.kafka.brokers") {
		KAFKA_BROKERS = viper.GetStringSlice("generator.kafka.brokers")
	}
}
