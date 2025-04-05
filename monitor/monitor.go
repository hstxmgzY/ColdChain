package monitor

import (
	"coldchain/monitor/clickhouse"
	"database/sql/driver"

	"github.com/gin-gonic/gin"
)

type Monitor struct {
	// 提供监控服务的 API
	ApiServer *gin.Engine

	// ClickHouse 数据库连接
	ClickHouse driver.Conn
}

func (m *Monitor) setupRoutes() {
	// 设置路由
	m.ApiServer.GET("/ws/monitor", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "Welcome to the Monitoring API",
		})
	})
}

func NewMonitor() *Monitor {
	// 初始化监控服务
	monitor := &Monitor{
		ApiServer:  gin.Default(),
		ClickHouse: clickhouse.GetConn(),
	}

	// 设置路由
	monitor.setupRoutes()

	return monitor
}

func (m *Monitor) Run() {
	// 启动 API 服务器
	m.ApiServer.Run(MONITOR_IP + ":" + MONITOR_PORT)
}
