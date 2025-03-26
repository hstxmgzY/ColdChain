package controllers

import (
	"coldchain/dao"
	"coldchain/dto"
	"coldchain/models"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type VehicleController struct {
	vehicleRepo *dao.VehicleRepository
}

func NewVehicleController(db *gorm.DB) *VehicleController {
	if db == nil {
		panic("NewUserController received nil DB instance")
	}
	return &VehicleController{
		vehicleRepo: dao.NewVehicleRepository(db),
	}
}

func (c *VehicleController) GetVehicleList(ctx *gin.Context) {
	vehicles, err := c.vehicleRepo.ListVehicles()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	response := make([]dto.VehicleResponse, 0, len(vehicles))
	for _, v := range vehicles {
		response = append(response, dto.VehicleResponse{
			ID:          v.ID,
			PlateNumber: v.PlateNumber,
			Status:      string(v.Status),
			MaxCapacity: v.MaxCapacity,
			ImgUrl:      v.ImgUrl,
		})
	}
	ctx.JSON(http.StatusOK, response)
}

func (c *VehicleController) AddVehicle(ctx *gin.Context) {
	var req dto.CreateVehicleRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 检查车牌号是否已存在
	exists, err := c.vehicleRepo.CheckPlateNumberExists(req.PlateNumber, 0)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "检查车牌号失败"})
		return
	}
	if exists {
		ctx.JSON(http.StatusConflict, gin.H{"error": "车牌号已存在"})
		return
	}

	vehicle := models.Vehicle{
		PlateNumber: req.PlateNumber,
		Status:      models.VehicleStatus(req.Status),
		MaxCapacity: req.MaxCapacity,
		ImgUrl:      req.ImgUrl,
	}

	if err := c.vehicleRepo.CreateVehicle(&vehicle); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusCreated, dto.VehicleResponse{
		ID:          vehicle.ID,
		PlateNumber: vehicle.PlateNumber,
		Status:      string(vehicle.Status),
		MaxCapacity: vehicle.MaxCapacity,
		ImgUrl:      vehicle.ImgUrl,
	})
}

func (c *VehicleController) UpdateVehicle(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "无效的车辆ID"})
		return
	}

	var req dto.UpdateVehicleRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	vehicle, err := c.vehicleRepo.GetVehicleByID(uint(id))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "车辆不存在"})
		return
	}

	// 更新字段
	if req.PlateNumber != nil {
		exists, err := c.vehicleRepo.CheckPlateNumberExists(*req.PlateNumber, uint(id))
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "检查车牌号失败"})
			return
		}
		if exists {
			ctx.JSON(http.StatusConflict, gin.H{"error": "车牌号已存在"})
			return
		}
		vehicle.PlateNumber = *req.PlateNumber
	}
	if req.Status != nil {
		vehicle.Status = models.VehicleStatus(*req.Status)
	}
	if req.MaxCapacity != nil {
		vehicle.MaxCapacity = *req.MaxCapacity
	}
	if req.ImgUrl != nil {
		vehicle.ImgUrl = *req.ImgUrl
	}

	if err := c.vehicleRepo.UpdateVehicle(vehicle); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	ctx.JSON(http.StatusOK, dto.VehicleResponse{
		ID:          vehicle.ID,
		PlateNumber: vehicle.PlateNumber,
		Status:      string(vehicle.Status),
		MaxCapacity: vehicle.MaxCapacity,
		ImgUrl:      vehicle.ImgUrl,
	})
}

func (c *VehicleController) DeleteVehicle(ctx *gin.Context) {
	idStr := ctx.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "无效的车辆ID"})
		return
	}

	if err := c.vehicleRepo.DeleteVehicle(uint(id)); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "删除车辆失败"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "车辆删除成功"})
}
