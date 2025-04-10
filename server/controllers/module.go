package controllers

import (
	"coldchain/common/mysql/models"
	"coldchain/server/dao"
	"coldchain/server/dto"
	"net/http"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type ModuleController struct {
	moduleRepo *dao.ModuleRepository
}

func NewModuleController(db *gorm.DB) *ModuleController {
	return &ModuleController{
		moduleRepo: dao.NewModuleRepository(db),
	}
}

func (c *ModuleController) AddModule(ctx *gin.Context) {
	var req dto.AddModuleRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err})
		return
	}

	module := models.Module{
		DeviceID:    req.DeviceID,
		Status:      models.StatusUnassigned,
		IsEnabled:   false,
		OrderItemID: nil,
	}

	if err := c.moduleRepo.CreateModule(&module); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "创建模块失败"})
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"message": "模块创建成功", "module_id": module.ID})
}

func (c *ModuleController) ListModules(ctx *gin.Context) {
	modules, err := c.moduleRepo.ListModules()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取模块列表失败"})
		return
	}

	var responses []dto.ModuleInfoDTO
	for _, module := range modules {
		responses = append(responses, dto.ModuleInfoDTO{
			ID:                 module.ID,
			DeviceID:           module.DeviceID,
			SettingTemperature: module.SettingTemperature,
			MaxTemperature:     module.MaxTemperature,
			MinTemperature:     module.MinTemperature,
			Status:             dto.ModuleStatus(module.Status),
			IsEnabled:          module.IsEnabled,
		})
	}

	ctx.JSON(http.StatusOK, responses)
}
