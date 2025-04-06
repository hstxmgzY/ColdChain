package router

import (
	"coldchain/common/logger"
	"coldchain/server/controllers"
	"coldchain/server/mysql"

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

	// 初始化控制器
	userCtrl := controllers.NewUserController(mysql.Db)

	// 用户路由组
	userGroup := r.Group("/api/user")
	{
		userGroup.GET("/list", userCtrl.GetUsers)
		userGroup.POST("/add", userCtrl.CreateUser)
		userGroup.GET("/:id", userCtrl.GetUserByID)
		userGroup.PUT("/update/:id", userCtrl.UpdateUser)
		userGroup.DELETE("/delete/:id", userCtrl.DeleteUser)
		userGroup.POST("/login", userCtrl.Login)
		userGroup.GET("/captcha", userCtrl.CaptchaGenerate)
	}

	// 初始化车辆控制器
	vehicleCtrl := controllers.NewVehicleController(mysql.Db)

	// 车辆路由组
	vehicleGroup := r.Group("/api/resource/vehicle")
	{
		vehicleGroup.GET("/list", vehicleCtrl.GetVehicleList)
		vehicleGroup.POST("/add", vehicleCtrl.AddVehicle)
		vehicleGroup.PUT("/update/:id", vehicleCtrl.UpdateVehicle)
		vehicleGroup.DELETE("/delete/:id", vehicleCtrl.DeleteVehicle)
	}
	// 初始化订单控制器
	orderCtrl := controllers.NewOrderController(mysql.Db)
	// 订单路由组
	orderGroup := r.Group("/api/orders")
	{
		orderGroup.GET("/:id", orderCtrl.GetOrderDetail)
		orderGroup.GET("/list", orderCtrl.ListOrders)
		orderGroup.POST("/create", orderCtrl.CreateOrder)
		orderGroup.PUT("/update/:id", orderCtrl.UpdateOrder)
		orderGroup.POST("/accept/:id", orderCtrl.AcceptOrder)
		orderGroup.POST("/reject/:id", orderCtrl.RejectOrder)
		orderGroup.POST("/module", orderCtrl.AddModule)
	}

	return r
}
