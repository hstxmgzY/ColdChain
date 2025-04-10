package dto

type CreateNotificationRequest struct {
	UserIDs []uint `json:"user_ids" binding:"required"` // 用户ID
	Type    string `json:"type" binding:"required"`     // 通知类型 (枚举)
	Title   string `json:"title" binding:"required"`    // 通知标题
	Content string `json:"content" binding:"required"`  // 通知内容
}

type NotificationInfoDTO struct {
	ID      uint   `json:"id"`      // 通知ID
	Type    string `json:"type"`    // 通知类型 (枚举)
	Title   string `json:"title"`   // 通知标题
	Content string `json:"content"` // 通知内容
	IsRead  bool   `json:"is_read"` // 是否已读
}
