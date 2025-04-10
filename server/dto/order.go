package dto

type OrderDTO struct {
	ID           uint           `json:"id"`
	OrderNumber  string         `json:"order_number"`
	TotalPrice   float64        `json:"total_price"`
	StatusName   string         `json:"status_name"`
	SenderInfo   interface{}    `json:"sender_info"`
	ReceiverInfo interface{}    `json:"receiver_info"`
	OrderNote    string         `json:"order_note"`
	User         UserDTO        `json:"user"`
	OrderItems   []OrderItemDTO `json:"order_items"`
}

type UserDTO struct {
	Username string `json:"username"`
	RoleName string `json:"role_name"`
}

type OrderItemDTO struct {
	ID        uint            `json:"id"`
	Quantity  int             `json:"quantity"`
	UnitPrice float64         `json:"unit_price"`
	Product   ProductDTO      `json:"product"`
	Module    []ModuleInfoDTO `json:"module"`
}

type ProductDTO struct {
	ID             uint    `json:"id"`
	ProductName    string  `json:"product_name"`
	CategoryName   string  `json:"category_name"`
	MaxTemperature float64 `json:"max_temperature"`
	MinTemperature float64 `json:"min_temperature"`
	SpecWeight     float64 `json:"spec_weight"`
	SpecVolume     float64 `json:"spec_volume"`
	ImageURL       string  `json:"image_url"`
}

type ModuleStatus string

const (
	StatusAssigned   ModuleStatus = "assigned"   // 设备分配
	StatusUnassigned ModuleStatus = "unassigned" // 设备未分配
	StatusFaulty     ModuleStatus = "faulty"     // 设备故障
)

type ModuleInfoDTO struct {
	ID                 uint         `json:"id"`
	DeviceID           string       `json:"device_id"`
	SettingTemperature float64      `json:"setting_temperature"`
	MaxTemperature     float64      `json:"max_temperature"`
	MinTemperature     float64      `json:"min_temperature"`
	Status             ModuleStatus `json:"status"`
	IsEnabled          bool         `json:"is_enabled"`
}

type CreateOrderRequest struct {
	UserID       uint                   `json:"user_id" binding:"required"`
	SenderInfo   map[string]interface{} `json:"sender_info" binding:"required"`
	ReceiverInfo map[string]interface{} `json:"receiver_info" binding:"required"`
	DeliveryDate string                 `json:"delivery_date" binding:"required"`
	OrderNote    string                 `json:"order_note"`
	OrderItems   []OrderItem            `json:"order_items" binding:"required"`
}

type OrderItem struct {
	Quantity int     `json:"quantity" binding:"required"`
	Product  Product `json:"product" binding:"required"`
}

type Product struct {
	ProductName    string  `json:"product_name" binding:"required"`
	CategoryName   string  `json:"category_name" binding:"required"`
	MaxTemperature float64 `json:"max_temperature" binding:"required"`
	MinTemperature float64 `json:"min_temperature" binding:"required"`
	SpecWeight     float64 `json:"spec_weight" binding:"required"`
	SpecVolume     float64 `json:"spec_volume" binding:"required"`
	ImageURL       string  `json:"image_url" binding:"required"`
}

type UpdateOrderRequest struct {
	OrderNumber  *string  `json:"order_number" binding:"required"`
	TotalPrice   *float64 `json:"total_price" binding:"required"`
	StatusID     *uint    `json:"status_id" binding:"required"`
	SenderInfo   *string  `json:"sender_info" binding:"required"`
	ReceiverInfo *string  `json:"receiver_info" binding:"required"`
	OrderNote    *string  `json:"order_note"`
}

type AddModuleRequest struct {
	DeviceID string `json:"device_id" binding:"required"`
}

type PayOrderRequest struct {
	OrderID uint `json:"order_id" binding:"required"`
}
