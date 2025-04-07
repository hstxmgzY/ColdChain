package main

import (
	"coldchain/monitor/clickhouse"
	"coldchain/monitor/router"
)

func main() {
	clickhouse.InitDB()
	importConfig()

	r := router.Router()
	r.Run(MONITOR_IP + ":" + MONITOR_PORT)
}
