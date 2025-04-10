package controllers

import (
	"coldchain/common/mysql/models"
	"coldchain/server/dao"
	"coldchain/server/dto"
	"net/http"
	"strconv"

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
	var notificationID uint
	if err := c.notificationReopository.Transaction(func(tx *gorm.DB) error {
		notification := models.Notification{
			Title:   req.Title,
			Content: req.Content,
			IsRead:  false,
			Type:    req.Type,
		}
		if err := tx.Create(&notification).Error; err != nil {
			return err
		}
		notificationID = notification.ID
		for _, userID := range req.UserIDs {
			userNotification := models.NotificationUser{
				UserID:         userID,
				NotificationID: notification.ID,
			}
			if err := tx.Create(&userNotification).Error; err != nil {
				return err
			}
		}

		return nil
	}); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "创建通知失败"})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"message": "通知创建成功", "notification_id": notificationID})
}

func (c *NotificationController) GetNotificationByUserID(ctx *gin.Context) {
	s := ctx.Param("user_id")
	userID, err := strconv.Atoi(s)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "无效的用户ID"})
		return
	}
	notifications, err := c.notificationReopository.GetNotificationByUserID(userID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取通知失败"})
		return
	}

	var response []dto.NotificationInfoDTO
	for _, notification := range notifications {
		response = append(response, dto.NotificationInfoDTO{
			ID:      notification.ID,
			Title:   notification.Title,
			Content: notification.Content,
			IsRead:  notification.IsRead,
			Type:    notification.Type,
		})
	}

	ctx.JSON(http.StatusOK, response)
}
