package services

import (
	"coldchain/monitor/dao"
	"encoding/json"
	"fmt"

	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
	"github.com/gorilla/websocket"
)

func MonitorTemperature(conn *websocket.Conn, deviceID string) error {
	// 1. 获取当前时间
	// 2. 获取当前时间的前30分钟
	// 3. 查询数据库，获取当前时间和前30分钟之间的温度数据
	// 4. 将温度数据转换为JSON格式
	// 5. 返回JSON格式的温度数据
	return nil
}

func MonitorBattery(conn *websocket.Conn, deviceID string) error {
	// 1. 获取当前时间
	// 2. 获取当前时间的前30分钟
	// 3. 查询数据库，获取当前时间和前30分钟之间的电池数据
	// 4. 将电池数据转换为JSON格式
	// 5. 返回JSON 格式的电池数据
	return nil
}

func MonitorAlarm(db driver.Conn, conn *websocket.Conn, deviceID string) error {
	alarms, err := dao.GetAlarmList(db, deviceID)
	if err != nil {
		return err
	}
	jsonData, err := json.Marshal(alarms)
	if err != nil {
		return err
	}
	fmt.Println("jsonData:", string(jsonData))
	return conn.WriteJSON(alarms)
}
