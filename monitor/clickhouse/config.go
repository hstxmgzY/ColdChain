package clickhouse

import "github.com/spf13/viper"

var (
	CLICKHOUSE_IP       string = "127.0.0.1"
	CLICKHOUSE_PORT     string = "9000"
	CLICKHOUSE_USER     string = "default"
	CLICKHOUSE_PASSWORD string = ""
	CLICKHOUSE_DATABASE string = "coldchain"
)

func importConfig() {
	if viper.IsSet("clickhouse.ip") {
		CLICKHOUSE_IP = viper.GetString("clickhouse.ip")
	}
	if viper.IsSet("clickhouse.port") {
		CLICKHOUSE_PORT = viper.GetString("clickhouse.port")
	}
	if viper.IsSet("clickhouse.user") {
		CLICKHOUSE_USER = viper.GetString("clickhouse.user")
	}
	if viper.IsSet("clickhouse.password") {
		CLICKHOUSE_PASSWORD = viper.GetString("clickhouse.password")
	}
	if viper.IsSet("clickhouse.database") {
		CLICKHOUSE_DATABASE = viper.GetString("clickhouse.database")
	}
}
