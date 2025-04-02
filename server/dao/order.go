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

func (r *OrderRepository) Transaction(fn func(tx *gorm.DB) error) error {
	tx := r.db.Begin()
	if err := fn(tx); err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit().Error
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

func (r *OrderRepository) ListOrders() ([]models.RentalOrder, error) {
	orders := []models.RentalOrder{}
	err := r.db.Preload("User.Role").
		Preload("OrderStatus").
		Preload("OrderItems.Product.Category").
		Find(&orders).Error
	if err != nil {
		return nil, err
	}
	return orders, nil
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

func (r *OrderRepository) GetCategoryByID(categoryID uint) (*models.Category, error) {
	var category models.Category
	err := r.db.First(&category, categoryID).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

func (r *OrderRepository) GetModulesByOrderItemID(orderItemID uint) ([]models.Module, error) {
	var modules []models.Module
	err := r.db.Where("order_item_id = ?", orderItemID).Find(&modules).Error
	if err != nil {
		return nil, err
	}
	return modules, nil
}

func (r *OrderRepository) CreateOrder(order *models.RentalOrder) error {
	err := r.db.Create(order).Error
	if err != nil {
		return err
	}
	return nil
}

func (r *OrderRepository) GetAllOrderItems() ([]models.OrderItem, error) {
	var orderItems []models.OrderItem
	err := r.db.Find(&orderItems).Error
	return orderItems, err
}

func (r *OrderRepository) CreateOrderItems(orderItems []models.OrderItem) error {
	err := r.db.Create(&orderItems).Error
	if err != nil {
		return err
	}
	return nil
}

func (r *OrderRepository) UpdateOrder(order *models.RentalOrder) error {
	err := r.db.Save(order).Error
	if err != nil {
		return err
	}
	return nil
}

func (r *OrderRepository) UpdateStatus(orderID, statusID uint) error {
	err := r.db.Table("rental_orders").Where("id = ?", orderID).Update("status_id", statusID).Error
	if err != nil {
		return handleDBError(err)
	}
	return nil
}

func (r *OrderRepository) GetOrederStatusIDByName(statusName string) (uint, error) {
	var orderStatus models.OrderStatus
	err := r.db.Where("status_name = ?", statusName).First(&orderStatus).Error
	if err != nil {
		return 0, err
	}
	return orderStatus.ID, nil
}

func (r *OrderRepository) GetCategoryIDByName(categoryName string) (uint, error) {
	var category models.Category
	err := r.db.Where("category_name = ?", categoryName).First(&category).Error
	if err != nil {
		return 0, err
	}
	return category.ID, nil
}

func (r *OrderRepository) CreateProduct(product *models.Product) error {
	err := r.db.Create(product).Error
	if err != nil {
		return err
	}
	return nil
}
