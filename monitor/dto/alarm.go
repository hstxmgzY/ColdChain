package dto

import "time"

type Alarm struct {
	DeviceID         string    `json:"device_id" ch:"device_id"`
	AlarmLevel       string    `json:"alarm_level" ch:"alarm_level"`
	AlarmStatus      string    `json:"alarm_status" ch:"alarm_status"`
	Remark           string    `json:"remark" ch:"remark"`
	TimeStamp        time.Time `json:"timestamp" ch:"time_stamp"`
	AlarmDescription string    `json:"alarm_description" ch:"alarm_description"`
}
