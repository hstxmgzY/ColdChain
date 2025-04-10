package dto

type CreateNotificationRequest struct {
	UserID  uint   `json:"user_id" binding:"required"` // 用户ID
	Type    string `json:"type" binding:"required"`    // 通知类型 (枚举)
	Title   string `json:"title" binding:"required"`   // 通知标题
	Content string `json:"content" binding:"required"` // 通知内容
}
