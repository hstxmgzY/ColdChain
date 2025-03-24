package router

import (
	"coldchain/controllers"
	"coldchain/dao" 
	"coldchain/pkg/logger"
	"github.com/gin-gonic/gin"
)

func Router() *gin.Engine {
	r := gin.Default()

	// 中间件配置
	r.Use(gin.LoggerWithConfig(logger.LoggerToFile()))
	r.Use(logger.Recover)
	

	// 初始化控制器
	userCtrl := controllers.NewUserController(dao.Db)

	// 用户路由组
	userGroup := r.Group("/users")
	{
		userGroup.GET("", userCtrl.GetUsers)
		userGroup.POST("", userCtrl.CreateUser)
		userGroup.PUT("/:id", userCtrl.UpdateUser)
		userGroup.DELETE("/:id", userCtrl.DeleteUser)
	}

	return r
}