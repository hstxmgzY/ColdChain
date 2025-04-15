package router

import (
	"coldchain/common/clickhouse"
	"coldchain/common/logger"
	"coldchain/monitor/controllers"

	"github.com/gin-gonic/gin"
)

func CorsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*") // 允许跨域
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")

		// 处理预检请求
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(200)
			return
		}

		c.Next()
	}
}

func Router() *gin.Engine {
	r := gin.Default()

	// 中间件配置
	r.Use(gin.LoggerWithConfig(logger.LoggerToFile()))
	r.Use(logger.Recover)
	r.Use(CorsMiddleware())

	m := controllers.NewMonitor(clickhouse.GetInstance())

	wsGroup := r.Group("/ws")
	{
		wsGroup.GET("monitor/temperature/:deviceID", m.MonitorTemperature)
	}

	httpGroup := r.Group("/api")
	{
		httpGroup.GET("monitor/temperature/list", m.ListTemperature)
		httpGroup.GET("monitor/alarm/:deviceID", m.GetAlarmByID)
		httpGroup.GET("monitor/alarm", m.ListAlarm)
	}

	return r
}
