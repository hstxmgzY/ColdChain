package main

import (
	"coldchain/database"
	"coldchain/models"
	"coldchain/pkg/logger"
	"coldchain/router"
	"fmt"
)

func main() {
	// 初始化数据库
	database.InitDB()
	if database.Db == nil {
		logger.Fatal(map[string]interface{}{"error": "数据库初始化失败"}, "Failed to initialize database")
		panic("数据库初始化失败")
	}
	fmt.Println("数据库连接成功") // 确保连接成功
	err := database.Db.AutoMigrate(
		&models.User{},
		&models.UserRole{},
		&models.OrderStatus{},
		&models.Category{},
		&models.Product{},
		&models.RentalOrder{},
		&models.OrderItem{},
		&models.Vehicle{},
		&models.Module{},
	)
	if err != nil {
		logger.Fatal(map[string]interface{}{"error": err.Error()}, "AutoMigrate failed")
	}
	logger.Info(map[string]interface{}{"message": "数据库迁移成功"}, "Database migrated successfully")
	// 启动路由
	r := router.Router()
	r.Run(":9999")
}
