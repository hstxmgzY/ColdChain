package clickhouse

import (
	"coldchain/common/logger"
	"context"
	"time"

	clickhouseDriver "github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

var clickhouseConn driver.Conn

func InitDB() {
	importConfig()
	// Initialize ClickHouse connection
	var err error
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

func GetConn() driver.Conn {
	return clickhouseConn
}
