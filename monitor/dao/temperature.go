package dao

import (
	"coldchain/monitor/dto"
	"context"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

// 获取设备最新的温度记录
func GetDevicesLatestTemperature(db driver.Conn) ([]dto.DeviceStatus, error) {
	var temperatures []dto.DeviceStatus
	err := db.Select(context.Background(), &temperatures, `
	SELECT
		device_id,
		argMax(temperature, time_stamp) AS temperature,
		argMax(battery_level, time_stamp) AS battery_level
	FROM module_monitor
	GROUP BY device_id;
	`)
	if err != nil {
		return nil, err
	}
	return temperatures, nil
}
