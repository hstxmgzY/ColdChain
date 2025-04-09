package kafka

import "github.com/IBM/sarama"

type Admin struct {
	admin sarama.ClusterAdmin
}

func NewAdmin(brokers []string) (*Admin, error) {
	config := sarama.NewConfig()
	config.Version = sarama.V2_4_0_0 // 设置Kafka版本
	admin, err := sarama.NewClusterAdmin(brokers, config)
	if err != nil {
		return nil, err
	}
	return &Admin{
		admin: admin,
	}, nil
}

func (a *Admin) CreateTopic(topic string, numPartitions int32, replicationFactor int16) error {
	topicDetail := &sarama.TopicDetail{
		NumPartitions:     numPartitions,
		ReplicationFactor: replicationFactor,
	}
	err := a.admin.CreateTopic(topic, topicDetail, false)
	if err != nil {
		return err
	}
	return nil
}

func (a *Admin) CreateTopicWithConfig(topic string, config map[string]*string, numPartitions int32, replicationFactor int16) error {
	topicDetail := &sarama.TopicDetail{
		NumPartitions:     numPartitions,
		ReplicationFactor: replicationFactor,
		ConfigEntries:     config,
	}
	err := a.admin.CreateTopic(topic, topicDetail, false)
	if err != nil {
		return err
	}
	return nil
}

func (a *Admin) Exists(topic string) (bool, error) {
	exists, err := a.admin.ListTopics()
	if err != nil {
		return false, err
	}
	_, isExists := exists[topic]
	if !isExists {
		return false, nil
	}
	return isExists, nil
}

func (a *Admin) UpdateTopic(topic string, config map[string]*string) error {
	err := a.admin.AlterConfig(sarama.TopicResource, topic, config, false)
	if err != nil {
		return err
	}
	return nil
}

func (a *Admin) Close() error {
	return a.admin.Close()
}
