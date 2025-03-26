package dto

type OrderDTO struct {
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
	ID        uint       `json:"id"`
	Quantity  int        `json:"quantity"`
	UnitPrice float64    `json:"unit_price"`
	Product   ProductDTO `json:"product"`
}

type ProductDTO struct {
	ID           uint    `json:"id"`
	ProductName  string  `json:"product_name"`
	CategoryName string  `json:"category_name"`
	SpecWeight   float64 `json:"spec_weight"`
	SpecVolume   float64 `json:"spec_volume"`
	ImageURL     string  `json:"image_url"`
}
