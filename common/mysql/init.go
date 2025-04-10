package mysql

import (
	"coldchain/common/logger"
	"coldchain/common/mysql/models"
	"time"

	"github.com/spf13/viper"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var Db *gorm.DB

// 数据库各种参数的默认值
var (
	MYSQL_HOST     string = "127.0.0.1"
	MYSQL_PORT     string = "3306"
	MYSQL_DATABASE string = "coldchain"
	MYSQL_USERNAME string = "root"
	MYSQL_PASSWORD string = ""
)

func importConfig() {
	if viper.IsSet("mysql.host") {
		MYSQL_HOST = viper.GetString("mysql.host")
	}
	if viper.IsSet("mysql.port") {
		MYSQL_PORT = viper.GetString("mysql.port")
	}
	if viper.IsSet("mysql.database") {
		MYSQL_DATABASE = viper.GetString("mysql.database")
	}
	if viper.IsSet("mysql.username") {
		MYSQL_USERNAME = viper.GetString("mysql.username")
	}
	if viper.IsSet("mysql.password") {
		MYSQL_PASSWORD = viper.GetString("mysql.password")
	}
}

func InitDB() {
	importConfig()

	var err error
	dsn := MYSQL_USERNAME + ":" + MYSQL_PASSWORD + "@tcp(" + MYSQL_HOST + ":" + MYSQL_PORT + ")/" + MYSQL_DATABASE + "?charset=utf8&parseTime=True&loc=Local"

	Db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		logger.Fatalf("MySQL Database connection failed")
		panic("MySQL Database connection failed: " + err.Error())
	}

	sqlDB, err := Db.DB()
	if err != nil {
		logger.Fatalf("Failed to get MySQL instance")
		panic("Failed to get DB instance: " + err.Error())
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	logger.Infof("Mysql initialized successfully")
	// 初始化数据库
	if Db == nil {
		logger.Fatalf("Failed to initialize database")
		panic("数据库初始化失败")
	}

	err = Db.AutoMigrate(
		&models.User{},
		&models.UserRole{},
		&models.OrderStatus{},
		&models.Category{},
		&models.Product{},
		&models.RentalOrder{},
		&models.OrderItem{},
		&models.Vehicle{},
		&models.Module{},
		&models.Notification{},
	)
	if err != nil {
		logger.Fatal(map[string]interface{}{"error": err.Error()}, "AutoMigrate failed")
	}
	logger.Infof("Database migrated successfully")
}

func GetInstance() *gorm.DB {
	return Db
}
