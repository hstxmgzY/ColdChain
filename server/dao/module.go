package dao

import (
	"coldchain/models"

	"gorm.io/gorm"
)

type ModuleRepository struct {
	db *gorm.DB
}

func NewModuleRepository(db *gorm.DB) *ModuleRepository {
	return &ModuleRepository{db: db}
}

// 查找可用的冷链模块
func (r *ModuleRepository) FindAvailableModules(quantity int) ([]models.Module, error) {
	var modules []models.Module
	err := r.db.
		Where("status = ?", "unassigned"). // 直接筛选未分配状态
		Limit(quantity).
		Find(&modules).Error
	return modules, err
}

// 分配模块给订单项
func (r *ModuleRepository) AssignModulesToOrderItem(orderItem models.OrderItem, modules []models.Module) error {

	for _, module := range modules {
		module.OrderItemID = &orderItem.ID
		module.Status = "assigned"
		if err := r.db.Save(&module).Error; err != nil {
			return handleDBError(err)
		}
	}

	return nil
}

func (r *ModuleRepository) CreateModule(module *models.Module) error {
	if err := r.db.Create(module).Error; err != nil {
		return handleDBError(err)
	}
	return nil
}
