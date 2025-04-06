package main

import "github.com/spf13/viper"

var (
	MONITOR_PORT string = "9998"
	MONITOR_IP   string = "0.0.0.0"
)

func importConfig() {
	if viper.IsSet("monitor.port") {
		MONITOR_PORT = viper.GetString("monitor.port")
	}
	if viper.IsSet("monitor.ip") {
		MONITOR_IP = viper.GetString("monitor.ip")
	}
}
