package services

import (
	"coldchain/common/logger"
	"fmt"

	"github.com/IBM/sarama"
	"github.com/gorilla/websocket"
)

// 消费Kafka消息的处理器
type TemperatureHandler struct {
	conn *websocket.Conn

	deviceID string
}

func NewTemperatureHandler(conn *websocket.Conn, deviceID string) *TemperatureHandler {
	return &TemperatureHandler{
		conn:     conn,
		deviceID: deviceID,
	}
}

func (th *TemperatureHandler) Setup(sarama.ConsumerGroupSession) error {
	return nil
}

func (th *TemperatureHandler) Cleanup(sarama.ConsumerGroupSession) error {
	return nil
}

func (th *TemperatureHandler) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for message := range claim.Messages() {
		// 处理消息
		deviceID := string(message.Key)
		msg := string(message.Value)
		var temperature, battery string
		fmt.Sscanf(msg, "%s %s", &temperature, &battery)
		logger.Debugf("Device %s temperature: %s, battery: %s", deviceID, temperature, battery)
		if deviceID != th.deviceID {
			continue
		}

		// 发送消息到WebSocket
		if err := th.conn.WriteMessage(websocket.TextMessage, []byte(temperature)); err != nil {
			return err
		}
	}
	return nil
}
