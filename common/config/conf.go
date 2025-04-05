package config

import (
	"coldchain/common/logger"
	"os"

	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
)

func init() {
	viper.AddConfigPath(".")
	viper.SetConfigFile("conf.yaml")
	viper.SetConfigType("yaml")
	if err := viper.ReadInConfig(); err != nil {
		logger.Error(logrus.Fields{"error": err}, "Failed to read the configuration file")
		os.Exit(-1)
	}
}
