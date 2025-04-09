package dao

import (
	"coldchain/common/mysql/models"
	"errors"

	"gorm.io/gorm"
)

type VehicleRepository struct {
	db *gorm.DB
}

func NewVehicleRepository(db *gorm.DB) *VehicleRepository {
	return &VehicleRepository{db: db}
}

func (r *VehicleRepository) ListVehicles() ([]models.Vehicle, error) {
	var vehicles []models.Vehicle
	if err := r.db.Find(&vehicles).Error; err != nil {
		return nil, handleDBError(err)
	}
	return vehicles, nil
}

func (r *VehicleRepository) CreateVehicle(vehicle *models.Vehicle) error {
	if err := r.db.Create(vehicle).Error; err != nil {
		return handleDBError(err)
	}
	return nil
}

func (r *VehicleRepository) GetVehicleByID(id uint) (*models.Vehicle, error) {
	var vehicle models.Vehicle
	if err := r.db.First(&vehicle, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, errors.New("车辆不存在")
		}
		return nil, handleDBError(err)
	}
	return &vehicle, nil
}

func (r *VehicleRepository) UpdateVehicle(vehicle *models.Vehicle) error {
	if err := r.db.Save(vehicle).Error; err != nil {
		return handleDBError(err)
	}
	return nil
}

func (r *VehicleRepository) DeleteVehicle(id uint) error {
	if err := r.db.Delete(&models.Vehicle{}, id).Error; err != nil {
		return handleDBError(err)
	}
	return nil
}

func (r *VehicleRepository) CheckPlateNumberExists(plateNumber string, excludeID uint) (bool, error) {
	var count int64
	query := r.db.Model(&models.Vehicle{}).Where("plate_number = ?", plateNumber)
	if excludeID > 0 {
		query = query.Where("id <> ?", excludeID)
	}
	if err := query.Count(&count).Error; err != nil {
		return false, err
	}
	return count > 0, nil
}
