package services

import (
	"coldchain/common/kafka"

	"github.com/gorilla/websocket"
)

type MonitorService struct {
	kf *kafka.Consumer
}

func NewMonitorService(brokers []string, topic string) *MonitorService {
	kf, err := kafka.NewConsumer(brokers, topic)
	if err != nil {
		panic(err)
	}
	return &MonitorService{
		kf: kf,
	}
}

func (ms *MonitorService) MonitorTemperature(conn *websocket.Conn, deviceID string) error {
	th := NewTemperatureHandler(conn, deviceID)
	for {
		err := ms.kf.Consume(th)
		if err != nil {
			return err
		}
	}
}

func (ms *MonitorService) MonitorBattery(conn *websocket.Conn, deviceID string) error {

	return nil
}
