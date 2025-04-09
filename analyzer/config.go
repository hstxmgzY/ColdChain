package main

import (
	"github.com/spf13/viper"

	_ "coldchain/common/config"
)

var (
	SOURCE_BROKERS = []string{"localhost:9092"}
	SINK_BROKERS   = []string{"localhost:9093"}
)

func importConfig() {
	if viper.IsSet("analyzer.source.brokers") {
		SOURCE_BROKERS = viper.GetStringSlice("analyzer.source.brokers")
	}
	if viper.IsSet("analyzer.sink.brokers") {
		SINK_BROKERS = viper.GetStringSlice("analyzer.sink.brokers")
	}
}
