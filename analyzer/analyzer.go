package main

import (
	"coldchain/common/kafka"
	"fmt"

	"github.com/IBM/sarama"
)

type Analyzer struct {
	Source *kafka.Consumer
	Sink   *kafka.Producer

	// 处理函数
	AnalysisFunc func(key string, value string) error
}

func NewAnalyzer(sourceBrokers, sinkBrokers []string, topic string) *Analyzer {
	source, err := kafka.NewConsumer(sourceBrokers, topic)
	if err != nil {
		panic(err)
	}

	sink, err := kafka.NewProducer(sinkBrokers, topic)
	if err != nil {
		panic(err)
	}
	return &Analyzer{
		Source: source,
		Sink:   sink,
	}
}

func (a *Analyzer) Setup(sarama.ConsumerGroupSession) error {
	return nil
}

func (a *Analyzer) Cleanup(sarama.ConsumerGroupSession) error {
	return nil
}

func (a *Analyzer) ConsumeClaim(session sarama.ConsumerGroupSession, claim sarama.ConsumerGroupClaim) error {
	for message := range claim.Messages() {
		// 处理消息
		if a.AnalysisFunc != nil {
			err := a.AnalysisFunc(string(message.Key), string(message.Value))
			if err != nil {
				fmt.Println("Analysis error:", err)
				continue
			}
		}
		// 发送消息到下游
		_, _, err := a.Sink.SendMessage(string(message.Key), string(message.Value))
		if err != nil {
			fmt.Println("Send message error:", err)
			continue
		}

		// 提交偏移量
		session.MarkMessage(message, "consumed")
	}

	return nil
}

func (a *Analyzer) SetAnalysisFunc(f func(key string, value string) error) *Analyzer {
	a.AnalysisFunc = f
	return a
}

func (a *Analyzer) Start() {
	// 消费消息
	go func() {
		for {
			err := a.Source.Consume(a)
			if err != nil {
				fmt.Println("Consume error:", err)
				return
			}
		}
	}()
}

func (a *Analyzer) Close() {
	if err := a.Source.Consumer.Close(); err != nil {
		panic(err)
	}
	if err := a.Sink.Close(); err != nil {
		panic(err)
	}
}
