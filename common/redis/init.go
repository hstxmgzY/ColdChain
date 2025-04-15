package redis

import (
	"github.com/go-redis/redis/v8"
	"github.com/spf13/viper"

	_ "coldchain/common/config"
	"coldchain/common/logger"
)

var (
	REDIS_HOST      = "localhost"
	REDIS_PORT      = "6379"
	REDIS_PASSWORD  = ""
	REDIS_DB        = 0
	REDIS_POOL_SIZE = 10
)

func importConfig() {
	if viper.IsSet("redis.host") {
		REDIS_HOST = viper.GetString("redis.host")
	}
	if viper.IsSet("redis.port") {
		REDIS_PORT = viper.GetString("redis.port")
	}
	if viper.IsSet("redis.password") {
		REDIS_PASSWORD = viper.GetString("redis.password")
	}
	if viper.IsSet("redis.db") {
		REDIS_DB = viper.GetInt("redis.db")
	}
	if viper.IsSet("redis.pool_size") {
		REDIS_POOL_SIZE = viper.GetInt("redis.pool_size")
	}
}

var redisClient *redis.Client

func InitDB() {
	importConfig()
	redisClient = redis.NewClient(&redis.Options{
		Addr:     REDIS_HOST + ":" + REDIS_PORT,
		Password: REDIS_PASSWORD,
		DB:       REDIS_DB,
		PoolSize: REDIS_POOL_SIZE,
	})
	if err := redisClient.Ping(redisClient.Context()).Err(); err != nil {
		panic("Failed to connect to Redis: " + err.Error())
	}
	logger.Infof("Redis initialized successfully")
}

func GetInstance() *redis.Client {
	return redisClient
}
