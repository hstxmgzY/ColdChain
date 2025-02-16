package router

import (
	"coldchain/controllers"
	"coldchain/pkg/logger"
	"github.com/gin-gonic/gin"
)

func Router() *gin.Engine {
	r := gin.Default()

	r.Use(gin.LoggerWithConfig(logger.LoggerToFile()))
	r.Use(logger.Recover)

	user := r.Group("/user")
	{
		user.GET("/info/:id", controllers.UserController{}.GetUserInfo)
		user.GET("/all", controllers.UserController{}.GetUserList)
		user.POST("/list", controllers.UserController{}.GetUserList)
		user.POST("/add", controllers.UserController{}.CreateUser)
		user.PUT("/update", controllers.UserController{}.UpdateUser)
		user.DELETE("/delete", controllers.UserController{}.DeleteUser)
	}
	return r
}