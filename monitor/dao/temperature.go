package dao

import (
	"coldchain/monitor/dto"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

func GetTemperatureData(db driver.Conn, deviceID string) ([]dto.Temperature, error) {
	var temperatures []dto.Temperature
	

	return temperatures, nil
}
