package dao

import (
	"coldchain/monitor/dto"
	"context"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

func GetAlarmList(db driver.Conn, deviceID string) ([]dto.Alarm, error) {
	var alarms []dto.Alarm
	err := db.Select(context.Background(), &alarms, "SELECT * FROM alarm_record where device_id = ?", deviceID)
	if err != nil {
		return nil, err
	}
	return alarms, nil
}
