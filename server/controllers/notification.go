package controllers

import (
	"coldchain/common/mysql/models"
	"coldchain/server/dao"
	"coldchain/server/dto"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type NotificationController struct {
	notificationReopository *dao.NotificationRepository
}

func NewNotificationController(db *gorm.DB) *NotificationController {
	return &NotificationController{
		notificationReopository: dao.NewNotificationRepository(db),
	}
}

func (c *NotificationController) CreateNotification(ctx *gin.Context) {
	var req dto.CreateNotificationRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	notification := models.Notification{
		Title:   req.Title,
		Content: req.Content,
		IsRead:  false,
		Type:    req.Type,
	}
	if err := c.notificationReopository.CreateNotification(&notification); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "创建通知失败"})
		return
	}
	ctx.JSON(http.StatusCreated, gin.H{"message": "通知创建成功", "notification_id": notification.ID})
}

func (c *NotificationController) GetNotificationByUserID(ctx *gin.Context) {

}
