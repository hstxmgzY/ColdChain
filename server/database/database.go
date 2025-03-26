package database

import (
	"coldchain/pkg/config"
	"coldchain/pkg/logger"
	"time"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var Db *gorm.DB

func InitDB() {
	var err error
	dsn := config.DB_USERNAME + ":" + config.DB_PASSWORD + "@tcp(" + config.DB_HOST + ":" + config.DB_PORT + ")/" + config.DB_DATABASE + "?charset=utf8&parseTime=True&loc=Local"

	Db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		logger.Fatal(map[string]interface{}{"error": err.Error()}, "Database connection failed")
		panic("Database connection failed: " + err.Error())
	}

	sqlDB, err := Db.DB()
	if err != nil {
		logger.Fatal(map[string]interface{}{"error": err.Error()}, "Failed to get DB instance")
		panic("Failed to get DB instance: " + err.Error())
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	logger.Info(map[string]interface{}{"message": "Database initialized successfully"})
}
