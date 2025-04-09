package kafka

import (
	"time"

	"github.com/IBM/sarama"
)

type Producer struct {
	syncProducer sarama.SyncProducer
	topic        string
}

func NewProducer(brokers []string, topic string) (*Producer, error) {
	config := sarama.NewConfig()
	config.Producer.RequiredAcks = sarama.WaitForLocal        // 等待本地副本写入成功
	config.Producer.Retry.Max = 5                             // 最大重试次数
	config.Producer.Return.Successes = true                   // 发送成功返回
	config.Producer.Partitioner = sarama.NewRandomPartitioner // 随机分区器

	producer, err := sarama.NewSyncProducer(brokers, config)
	if err != nil {
		return nil, err
	}

	return &Producer{
		syncProducer: producer,
		topic:        topic,
	}, nil
}

func (kp *Producer) SendMessage(key, value string) (int32, int64, error) {
	msg := &sarama.ProducerMessage{
		Topic:     kp.topic,
		Key:       sarama.StringEncoder(key),
		Value:     sarama.StringEncoder(value),
		Timestamp: time.Now(),
	}

	partition, offset, err := kp.syncProducer.SendMessage(msg)
	if err != nil {
		return 0, 0, err
	}

	return partition, offset, nil
}

func (kp *Producer) Close() error {
	return kp.syncProducer.Close()
}
