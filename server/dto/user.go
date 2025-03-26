package dto

// 地址对象定义
type Address struct {
	Name   string `json:"name" binding:"required"`   // 收件人姓名
	Phone  string `json:"phone" binding:"required"`  // 地址联系电话
	Detail string `json:"detail" binding:"required"` // 详细地址
}

type UserResponse struct {
	ID       uint      `json:"user_id"`
	Username string    `json:"username"`
	Role     string    `json:"role"`
	Phone    string    `json:"phone"`
	Address  []Address `json:"address"`
}

type CreateUserRequest struct {
	Username string    `json:"username" binding:"required"`
	Password string    `json:"password" binding:"required,min=8"`
	Phone    string    `json:"phone" binding:"required"`
	Role     string    `json:"role" binding:"required"`
	Address  []Address `json:"address" binding:"omitempty,dive"` // 地址可以为空
}

type UpdateUserRequest struct {
	Username *string    `json:"username"`
	Password *string    `json:"password" binding:"omitempty,min=8"`
	Phone    *string    `json:"phone" binding:"omitempty"`
	Role     *string    `json:"role"`
	Address  *[]Address `json:"address" binding:"omitempty,dive"` // 允许更新地址数组
}
