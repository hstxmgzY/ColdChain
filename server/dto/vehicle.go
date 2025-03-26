package dto

type VehicleResponse struct {
	ID          uint   `json:"id"`
	PlateNumber string `json:"plateNumber"`
	Status      string `json:"status"`
	MaxCapacity int    `json:"MaxCapacity"`
	ImgUrl      string `json:"imgUrl"`
}

type CreateVehicleRequest struct {
	PlateNumber string `json:"plateNumber" binding:"required"`
	Status      string `json:"status" binding:"required,oneof=空闲 使用中 维修中 停用"`
	MaxCapacity int    `json:"MaxCapacity" binding:"required,min=1"`
	ImgUrl      string `json:"imgUrl" binding:"omitempty,url"`
}

type UpdateVehicleRequest struct {
	PlateNumber *string `json:"plateNumber"`
	Status      *string `json:"status" binding:"omitempty,oneof=空闲 使用中 维修中 停用"`
	MaxCapacity *int    `json:"MaxCapacity" binding:"omitempty,min=1"`
	ImgUrl      *string `json:"imgUrl" binding:"omitempty,url"`
}
