package main

import (
	"coldchain/common/clickhouse"
	"coldchain/monitor/config"
	"coldchain/monitor/router"
)

func main() {
	config.ImportConfig()
	clickhouse.InitDB()

	r := router.Router()
	r.Run(config.MONITOR_IP + ":" + config.MONITOR_PORT)
}
