package mysql

import (
	"coldchain/common/logger"
	"coldchain/server/models"
	"time"

	"github.com/spf13/viper"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var Db *gorm.DB

// 数据库各种参数的默认值
var (
	MYSQL_HOST               string        = "127.0.0.1"
	MYSQL_PORT               string        = "3306"
	MYSQL_DATABASE           string        = "coldchain"
	MYSQL_USERNAME           string        = "root"
	MYSQL_PASSWORD           string        = ""
	MYSQL_MAX_OPEN_CONNS     int           = 100
	MYSQL_MAX_IDLE_CONNS     int           = 10
	MYSQL_CONN_MAX_LIFE_TIME time.Duration = time.Hour
	MYSQL_CONN_MAX_IDLE_TIME time.Duration = time.Hour
)

func importConfig() {
	// 这里可以添加一些配置导入的逻辑
	// 例如从环境变量或配置文件中读取数据库连接信息

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
	if viper.IsSet("mysql.max_open_connections") {
		MYSQL_MAX_OPEN_CONNS = viper.GetInt("mysql.max_open_connections")
	}
	if viper.IsSet("mysql.max_idle_connections") {
		MYSQL_MAX_IDLE_CONNS = viper.GetInt("mysql.max_idle_connections")
	}
	if viper.IsSet("mysql.connection_max_life_time") {
		MYSQL_CONN_MAX_LIFE_TIME = viper.GetDuration("mysql.connection_max_life_time")
	}
	if viper.IsSet("mysql.connection_max_idle_time") {
		MYSQL_CONN_MAX_IDLE_TIME = viper.GetDuration("mysql.connection_max_idle_time")
	}
}

func InitDB() {
	importConfig()

	var err error
	dsn := MYSQL_USERNAME + ":" + MYSQL_PASSWORD + "@tcp(" + MYSQL_HOST + ":" + MYSQL_PORT + ")/" + MYSQL_DATABASE + "?charset=utf8&parseTime=True&loc=Local"

	Db, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		logger.Fatal(map[string]interface{}{"error": err.Error()}, "MySQL Database connection failed")
		panic("MySQL Database connection failed: " + err.Error())
	}

	sqlDB, err := Db.DB()
	if err != nil {
		logger.Fatal(map[string]interface{}{"error": err.Error()}, "Failed to get MySQL instance")
		panic("Failed to get DB instance: " + err.Error())
	}

	sqlDB.SetMaxIdleConns(10)
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetConnMaxLifetime(time.Hour)

	logger.Info(map[string]interface{}{"message": "Mysql initialized successfully"})
	// 初始化数据库
	if Db == nil {
		logger.Fatal(map[string]interface{}{"error": "数据库初始化失败"}, "Failed to initialize database")
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
	)
	if err != nil {
		logger.Fatal(map[string]interface{}{"error": err.Error()}, "AutoMigrate failed")
	}
	logger.Info(map[string]interface{}{"message": "数据库迁移成功"}, "Database migrated successfully")
}
