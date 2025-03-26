package controllers

import (
	"coldchain/dao"
	"coldchain/dto"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type OrderController struct {
	orderRepo *dao.OrderRepository
	userRepo  *dao.UserRepository
}

func NewOrderController(db *gorm.DB) *OrderController {
	if db == nil {
		panic("NewOrderController received nil DB instance")
	}
	return &OrderController{
		orderRepo: dao.NewOrderRepository(db),
		userRepo:  dao.NewUserRepository(db),
	}
}

func (c *OrderController) GetOrderDetail(ctx *gin.Context) {
	orderID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "无效的订单ID"})
		return
	}

	// 获取订单数据
	order, err := c.orderRepo.GetOrderByID(uint(orderID))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "订单不存在"})
		return
	}

	statusName, err := c.orderRepo.GetOrderStatusName(order.StatusID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取订单状态失败"})
		return
	}

	user, err := c.userRepo.GetUserByID(order.UserID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取用户信息失败"})
		return
	}

	// 组装 DTO
	response := dto.OrderDTO{
		OrderNumber:  order.OrderNumber,
		TotalPrice:   order.TotalPrice,
		StatusName:   statusName,
		SenderInfo:   order.SenderInfo,
		ReceiverInfo: order.ReceiverInfo,
		OrderNote:    order.OrderNote,
		User: dto.UserDTO{
			Username: user.Username,
			RoleName: user.Role.RoleName,
		},
		OrderItems: []dto.OrderItemDTO{},
	}

	orderItems, err := c.orderRepo.GetOrderItemsByOrderID(order.ID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取订单明细失败"})
		return
	}

	// 组装订单明细
	for _, item := range orderItems {

		product, err := c.orderRepo.GetProductByID(item.ProductID)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取产品信息失败"})
			return
		}
		category, err := c.orderRepo.GetCategoryByID(product.CategoryID)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取产品分类失败"})
			return
		}

		response.OrderItems = append(response.OrderItems, dto.OrderItemDTO{
			ID:        item.ID,
			Quantity:  item.Quantity,
			UnitPrice: item.UnitPrice,
			Product: dto.ProductDTO{
				ID:           product.ID,
				ProductName:  product.ProductName,
				CategoryName: category.CategoryName, // 这里返回 CategoryName
				SpecWeight:   product.SpecWeight,
				SpecVolume:   product.SpecVolume,
				ImageURL:     product.ImageURL,
			},
		})
	}

	ctx.JSON(http.StatusOK, response)
}
