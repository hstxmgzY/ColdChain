package config

import (
	"os"
	"coldchain/pkg/logger"
	"github.com/spf13/viper"
	"github.com/sirupsen/logrus"
)

func init() {
	viper.AddConfigPath(".")
	viper.SetConfigFile("conf.yaml")
	viper.SetConfigType("yaml")
	if err := viper.ReadInConfig(); err != nil {
		logger.Error(logrus.Fields{"error": err}, "Failed to read the configuration file")
		os.Exit(-1)
	}

	if viper.IsSet("database.host") {
		DB_HOST = viper.GetString("database.host")
	}
	if viper.IsSet("database.port") {
		DB_PORT = viper.GetString("database.port")
	}
	if viper.IsSet("database.database") {
		DB_DATABASE = viper.GetString("database.database")
	}
	if viper.IsSet("database.username") {
		DB_USERNAME = viper.GetString("database.username")
	}
	if viper.IsSet("database.password") {
		DB_PASSWORD = viper.GetString("database.password")
	}
	if viper.IsSet("database.max_open_connections") {
		DB_MAX_OPEN_CONNS = viper.GetInt("database.max_open_connections")
	}
	if viper.IsSet("database.max_idle_connections") {
		DB_MAX_IDLE_CONNS = viper.GetInt("database.max_idle_connections")
	}
	if viper.IsSet("database.connection_max_life_time") {
		DB_CONN_MAX_LIFE_TIME = viper.GetDuration("database.connection_max_life_time")
	}
	if viper.IsSet("database.connection_max_idle_time") {
		DB_CONN_MAX_IDLE_TIME = viper.GetDuration("database.connection_max_idle_time")
	}
	if viper.IsSet("server.admin") {
		DEFAULT_ADMIN = viper.GetString("server.admin")
	}
	if viper.IsSet("server.password") {
		DEFAULT_ADMIN_PASSWORD = viper.GetString("server.password")
	}
}