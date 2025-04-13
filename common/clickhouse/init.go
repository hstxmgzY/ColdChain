package clickhouse

import (
	"coldchain/common/logger"
	"context"
	"fmt"
	"time"

	_ "coldchain/common/config"

	clickhouseDriver "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/spf13/viper"
)

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

var clickhouseConn driver.Conn

func InitDB() {
	importConfig()
	// Initialize ClickHouse connection
	var err error
	fmt.Println("Connecting to ClickHouse at " + CLICKHOUSE_IP + ":" + CLICKHOUSE_PORT)
	fmt.Println("ClickHouse User: " + CLICKHOUSE_USER + " Password: " + CLICKHOUSE_PASSWORD)
	clickhouseConn, err = clickhouseDriver.Open(&clickhouseDriver.Options{
		Addr: []string{CLICKHOUSE_IP + ":" + CLICKHOUSE_PORT},
		Auth: clickhouseDriver.Auth{
			Database: CLICKHOUSE_DATABASE,
			Username: CLICKHOUSE_USER,
			Password: CLICKHOUSE_PASSWORD,
		},
		DialTimeout: 10 * time.Second,
	})

	if err != nil {
		panic("Failed to connect to ClickHouse: " + err.Error())
	}

	if err := clickhouseConn.Ping(context.Background()); err != nil {
		panic("Failed to ping ClickHouse: " + err.Error())
	}

	logger.Infof("ClickHouse connection established successfully")
}

func GetInstance() driver.Conn {
	return clickhouseConn
}
