package dto

import "time"

type Alarm struct {
	DeviceID         string    `json:"device_id" ch:"device_id"`
	AlarmLevel       string    `json:"alarm_level" ch:"alarm_level"`
	AlarmStatus      string    `json:"alarm_status" ch:"alarm_status"`
	ReMark           string    `json:"remark" ch:"remark"`
	EventTime        time.Time `json:"event_time" ch:"event_time"`
	AlarmDescription string    `json:"alarm_description" ch:"alarm_description"`
}
