package dao

import (
	"coldchain/models"

	"gorm.io/gorm"
)

type OrderRepository struct {
	db *gorm.DB
}

func NewOrderRepository(db *gorm.DB) *OrderRepository {
	return &OrderRepository{db: db}
}

func (r *OrderRepository) GetOrderByID(orderID uint) (*models.RentalOrder, error) {
	var order models.RentalOrder

	err := r.db.Preload("User.Role").
		Preload("OrderStatus").
		Preload("OrderItems.Product.Category").
		First(&order, orderID).Error

	if err != nil {
		return nil, err
	}

	return &order, nil
}

func (r *OrderRepository) GetOrderStatusName(statusID uint) (string, error) {
	var orderStatus models.OrderStatus
	err := r.db.First(&orderStatus, statusID).Error
	if err != nil {
		return "", err
	}
	return orderStatus.StatusName, nil
}

func (r *OrderRepository) GetOrderItemsByOrderID(orderID uint) ([]models.OrderItem, error) {
	var orderItems []models.OrderItem
	err := r.db.Where("order_id = ?", orderID).Find(&orderItems).Error
	if err != nil {
		return nil, err
	}
	return orderItems, nil
}

func (r *OrderRepository) GetProductByID(productID uint) (*models.Product, error) {
	var product models.Product
	err := r.db.First(&product, productID).Error
	if err != nil {
		return nil, err
	}
	return &product, nil
}

func (r *OrderRepository) GetCategoryByID(categoryID uint) (*models.ProductCategory, error) {
	var category models.ProductCategory
	err := r.db.First(&category, categoryID).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}
