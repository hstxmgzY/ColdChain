package kafka

import "github.com/IBM/sarama"

type Consumer struct {
	Consumer sarama.Consumer
	Topic    string
}

func NewKafkaConsumer(brokers []string, topic string) (*Consumer, error) {
	config := sarama.NewConfig()
	config.Consumer.Return.Errors = true

	consumer, err := sarama.NewConsumer(brokers, config)
	if err != nil {
		return nil, err
	}

	return &Consumer{
		Consumer: consumer,
		Topic:    topic,
	}, nil
}

func (kc *Consumer) ReadMessages() (sarama.PartitionConsumer, error) {
	partitionList, err := kc.Consumer.Partitions(kc.Topic)
	if err != nil {
		return nil, err
	}

	// 选择第一个分区
	partition := partitionList[0]

	pc, err := kc.Consumer.ConsumePartition(kc.Topic, partition, sarama.OffsetNewest)
	if err != nil {
		return nil, err
	}

	pc.IsPaused()

	return pc, nil
}
