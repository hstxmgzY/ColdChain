package kafka

import (
	"context"

	"github.com/IBM/sarama"
)

// 消费指定主题的消息
type Consumer struct {
	Consumer sarama.ConsumerGroup
	Topic    string
}

func NewConsumer(brokers []string, topic string) (*Consumer, error) {
	config := sarama.NewConfig()
	config.Consumer.Return.Errors = true
	config.Consumer.Offsets.Initial = sarama.OffsetNewest // 从最新的偏移量开始消费

	consumerGroup, err := sarama.NewConsumerGroup(brokers, topic, config)
	if err != nil {
		return nil, err
	}

	return &Consumer{
		Consumer: consumerGroup,
		Topic:    topic,
	}, nil
}

func (cg *Consumer) Consume(handler sarama.ConsumerGroupHandler) error {
	for {
		if err := cg.Consumer.Consume(context.Background(), []string{cg.Topic}, handler); err != nil {
			return err
		}
	}
}
