package main

import (
	"coldchain/common/mysql"
	"coldchain/server/router"
)

func main() {
	importConfig()
	mysql.InitDB()

	// 启动路由
	r := router.Router()
	r.Run(SERVER_IP + ":" + SERVER_PORT)
}
