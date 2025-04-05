package main

import "github.com/spf13/viper"

var (
	SERVER_DEFAULT_ADMIN          string = "clodchain"
	SERVER_DEFAULT_ADMIN_PASSWORD string = "00000000"
	SERVER_PORT                   string = "9999"
	SERVER_IP                     string = "0.0.0.0"
)

func importConfig() {
	if viper.IsSet("server.admin") {
		SERVER_DEFAULT_ADMIN = viper.GetString("server.admin")
	}
	if viper.IsSet("server.password") {
		SERVER_DEFAULT_ADMIN_PASSWORD = viper.GetString("server.password")
	}
	if viper.IsSet("server.port") {
		SERVER_PORT = viper.GetString("server.port")
	}
	if viper.IsSet("server.ip") {
		SERVER_IP = viper.GetString("server.ip")
	}
}
