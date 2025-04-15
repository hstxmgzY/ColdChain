package controllers

import (
	"coldchain/common/logger"
	"coldchain/common/mysql/models"
	"coldchain/server/dao"
	"coldchain/server/dto"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type OrderController struct {
	orderRepo  *dao.OrderRepository
	userRepo   *dao.UserRepository
	moduleRepo *dao.ModuleRepository
}

func NewOrderController(db *gorm.DB) *OrderController {
	if db == nil {
		panic("NewOrderController received nil DB instance")
	}
	return &OrderController{
		orderRepo:  dao.NewOrderRepository(db),
		userRepo:   dao.NewUserRepository(db),
		moduleRepo: dao.NewModuleRepository(db),
	}
}

func (c *OrderController) genOrderNumber() string {
	// 生成订单号的逻辑
	// 这里简单返回一个随机字符串，实际应用中可以使用更复杂的算法
	return fmt.Sprintf("ORD-%d", time.Now().UnixNano())
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

	// 组装 DTO
	response := dto.OrderDTO{
		ID:           order.ID,
		OrderNumber:  order.OrderNumber,
		TotalPrice:   order.TotalPrice,
		DeliveryDate: order.DeliveryDate.Format("2006-01-02 15:04"),
		StatusName:   statusName,
		SenderInfo:   order.SenderInfo,
		ReceiverInfo: order.ReceiverInfo,
		OrderNote:    order.OrderNote,
		User: dto.UserDTO{
			Username: order.User.Username,
			RoleName: order.User.Role.RoleName,
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

		modules, err := c.orderRepo.GetModulesByOrderItemID(item.ID)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取模块信息失败"})
			return
		}
		var moduleDTOs []dto.ModuleInfoDTO
		for _, module := range modules {
			moduleDTOs = append(moduleDTOs, dto.ModuleInfoDTO{
				ID:                 module.ID,
				DeviceID:           module.DeviceID,
				SettingTemperature: module.SettingTemperature,
				Status:             dto.ModuleStatus(module.Status),
				IsEnabled:          module.IsEnabled,
			})
		}

		response.OrderItems = append(response.OrderItems, dto.OrderItemDTO{
			ID:        item.ID,
			Quantity:  item.Quantity,
			UnitPrice: item.UnitPrice,
			Product: dto.ProductDTO{
				ID:             product.ID,
				ProductName:    product.ProductName,
				CategoryName:   category.CategoryName,
				MaxTemperature: product.MaxTemperature,
				MinTemperature: product.MinTemperature,
				SpecWeight:     product.SpecWeight,
				SpecVolume:     product.SpecVolume,
				ImageURL:       product.ImageURL,
			},
		})
	}

	ctx.JSON(http.StatusOK, response)
}

func (c *OrderController) ListOrders(ctx *gin.Context) {
	// 获取所有订单
	orders, err := c.orderRepo.ListOrders()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取订单列表失败"})
		return
	}

	var responses []dto.OrderDTO
	for _, order := range orders {
		statusName, err := c.orderRepo.GetOrderStatusName(order.StatusID)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取订单状态失败"})
			return
		}

		response := dto.OrderDTO{
			ID:           order.ID,
			OrderNumber:  order.OrderNumber,
			TotalPrice:   order.TotalPrice,
			DeliveryDate: order.DeliveryDate.Format("2006-01-02 15:04"),
			StatusName:   statusName,
			SenderInfo:   order.SenderInfo,
			ReceiverInfo: order.ReceiverInfo,
			OrderNote:    order.OrderNote,
			User: dto.UserDTO{
				Username: order.User.Username,
				RoleName: order.User.Role.RoleName,
			},
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

			modules, err := c.orderRepo.GetModulesByOrderItemID(item.ID)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取模块信息失败"})
				return
			}

			var moduleDTOs []dto.ModuleInfoDTO
			for _, module := range modules {
				moduleDTOs = append(moduleDTOs, dto.ModuleInfoDTO{
					ID:                 module.ID,
					DeviceID:           module.DeviceID,
					SettingTemperature: module.SettingTemperature,
					Status:             dto.ModuleStatus(module.Status),
					IsEnabled:          module.IsEnabled,
				})
			}

			response.OrderItems = append(response.OrderItems, dto.OrderItemDTO{
				ID:        item.ID,
				Quantity:  item.Quantity,
				UnitPrice: item.UnitPrice,
				Product: dto.ProductDTO{
					ID:             product.ID,
					ProductName:    product.ProductName,
					CategoryName:   category.CategoryName,
					MaxTemperature: product.MaxTemperature,
					MinTemperature: product.MinTemperature,
					SpecWeight:     product.SpecWeight,
					SpecVolume:     product.SpecVolume,
					ImageURL:       product.ImageURL,
				},
				Module: moduleDTOs,
			})
		}

		responses = append(responses, response)
	}

	ctx.JSON(http.StatusOK, responses)
}

func (c *OrderController) ListOrdersByUserID(ctx *gin.Context) {
	s := ctx.Param("id")
	userID, err := strconv.Atoi(s)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "无效的用户ID"})
		return
	}

	orders, err := c.orderRepo.ListOrdersByUserID(uint(userID))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取订单列表失败"})
		return
	}

	var responses []dto.OrderDTO
	for _, order := range orders {
		statusName, err := c.orderRepo.GetOrderStatusName(order.StatusID)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取订单状态失败"})
			return
		}

		orderItem := make([]dto.OrderItemDTO, len(order.OrderItems))
		for i, item := range order.OrderItems {
			orderItem[i] = dto.OrderItemDTO{
				ID:        item.ID,
				Quantity:  item.Quantity,
				UnitPrice: item.UnitPrice,
				Product: dto.ProductDTO{
					ID:             item.Product.ID,
					ProductName:    item.Product.ProductName,
					CategoryName:   item.Product.Category.CategoryName,
					MaxTemperature: item.Product.MaxTemperature,
					MinTemperature: item.Product.MinTemperature,
					SpecWeight:     item.Product.SpecWeight,
					SpecVolume:     item.Product.SpecVolume,
					ImageURL:       item.Product.ImageURL,
				},
				Module: make([]dto.ModuleInfoDTO, len(item.Modules)),
			}

			for j, module := range item.Modules {
				orderItem[i].Module[j] = dto.ModuleInfoDTO{
					ID:                 module.ID,
					DeviceID:           module.DeviceID,
					SettingTemperature: module.SettingTemperature,
					Status:             dto.ModuleStatus(module.Status),
					IsEnabled:          module.IsEnabled,
				}
			}
		}

		response := dto.OrderDTO{
			ID:           order.ID,
			OrderNumber:  order.OrderNumber,
			TotalPrice:   order.TotalPrice,
			DeliveryDate: order.DeliveryDate.Format("2006-01-02 15:04"),
			StatusName:   statusName,
			SenderInfo:   order.SenderInfo,
			ReceiverInfo: order.ReceiverInfo,
			OrderNote:    order.OrderNote,
			User: dto.UserDTO{
				Username: order.User.Username,
				RoleName: order.User.Role.RoleName,
			},
			OrderItems: orderItem,
		}

		responses = append(responses, response)
	}

	ctx.JSON(http.StatusOK, responses)
}

func (c *OrderController) CreateOrder(ctx *gin.Context) {
	var req dto.CreateOrderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误"})
		logger.Errorf("请求参数错误: %v", err)
		return
	}

	// 验证用户是否存在
	_, err := c.userRepo.GetUserByID(req.UserID)
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	sender_info, err := json.Marshal(req.SenderInfo)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "发件人信息格式错误"})
		return
	}
	receiver_info, err := json.Marshal(req.ReceiverInfo)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "收件人信息格式错误"})
		return
	}

	delivery_date, err := time.Parse("2006-01-02 15:04", req.DeliveryDate)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "交付日期格式错误"})
		return
	}

	StatusID, err := c.orderRepo.GetOrderStatusIDByName("待支付")
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取订单状态失败"})
		return
	}

	order := models.RentalOrder{
		OrderNumber:  c.genOrderNumber(),
		StatusID:     StatusID,
		SenderInfo:   sender_info,
		ReceiverInfo: receiver_info,
		DeliveryDate: delivery_date,
		OrderNote:    req.OrderNote,
		UserID:       req.UserID,
	}

	err = c.orderRepo.Transaction(func(tx *gorm.DB) error {
		orderTxn := dao.NewOrderRepository(tx)

		orderItems := make([]models.OrderItem, 0)
		var totalPrice float64

		for _, item := range req.OrderItems {
			Category, err := orderTxn.GetCategoryByName(item.Product.CategoryName)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取产品分类失败"})
				return err
			}

			totalPrice += float64(item.Quantity) * Category.Price

			product := &models.Product{
				ProductName:    item.Product.ProductName,
				CategoryID:     Category.ID,
				MaxTemperature: item.Product.MaxTemperature,
				MinTemperature: item.Product.MinTemperature,
				SpecWeight:     item.Product.SpecWeight,
				SpecVolume:     item.Product.SpecVolume,
				ImageURL:       item.Product.ImageURL,
			}

			err = orderTxn.CreateProduct(product)
			if err != nil {
				// 如果产品已存在，则不创建新产品
				if err != gorm.ErrDuplicatedKey {
					ctx.JSON(http.StatusInternalServerError, gin.H{"error": "创建产品失败"})
					return err
				}
			}

			orderItem := models.OrderItem{
				Quantity:  item.Quantity,
				ProductID: product.ID,
				UnitPrice: Category.Price * float64(item.Quantity),
			}
			orderItems = append(orderItems, orderItem)
		}
		order.TotalPrice = totalPrice

		if err := orderTxn.CreateOrder(&order); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "创建订单失败"})
			return err
		}

		for i := range orderItems {
			orderItems[i].OrderID = order.ID
		}

		if err := orderTxn.CreateOrderItems(orderItems); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "创建订单明细失败"})
			return err
		}
		return nil
	})
	if err != nil {
		return
	}

	ctx.JSON(http.StatusCreated, gin.H{"message": "订单创建成功", "order_id": order.ID})
}

func (c *OrderController) GetOrderStatus(ctx *gin.Context) {
	orderID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "无效的订单ID"})
		return
	}

	statusName, err := c.orderRepo.GetOrderStatusName(uint(orderID))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取订单状态失败"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"status": statusName})
}
func (c *OrderController) UpdateOrder(ctx *gin.Context) {
	var req dto.UpdateOrderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误"})
		return
	}

	orderID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "无效的订单ID"})
		return
	}

	order, err := c.orderRepo.GetOrderByID(uint(orderID))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "订单不存在"})
		return
	}

	if req.TotalPrice != nil {
		order.TotalPrice = *req.TotalPrice
	}
	if req.DeliveryDate != nil {
		order.DeliveryDate, err = time.Parse("2006-01-02 15:04", *req.DeliveryDate)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "交付日期格式错误"})
			return
		}
	}
	if req.OrderNumber != nil {
		order.OrderNumber = *req.OrderNumber
	}
	if req.StatusID != nil {
		order.StatusID = *req.StatusID
	}
	if req.SenderInfo != nil {
		senderInfoJSON, err := json.Marshal(*req.SenderInfo)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "发件人信息格式错误"})
			return
		}
		order.SenderInfo = datatypes.JSON(senderInfoJSON)
	}
	if req.ReceiverInfo != nil {
		receiverInfoJSON, err := json.Marshal(*req.ReceiverInfo)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "收件人信息格式错误"})
			return
		}
		order.ReceiverInfo = datatypes.JSON(receiverInfoJSON)
	}
	if req.OrderNote != nil {
		order.OrderNote = *req.OrderNote
	}

	if err := c.orderRepo.UpdateOrder(order); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "更新订单失败"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "订单更新成功"})
}

// AllocateColdChainModules 处理冷链模块分配
func (c *OrderController) AllocateColdChainModules(ctx *gin.Context, tx *gorm.DB, orderItems []models.OrderItem) bool {
	moduleTxn := dao.NewModuleRepository(tx)

	for _, orderItem := range orderItems {
		availableModules, err := moduleTxn.FindAvailableModules(orderItem.Quantity)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "查找可用冷链箱失败"})
			return false
		}

		if len(availableModules) < orderItem.Quantity {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "可用冷链箱数量不足"})
			return false
		}

		if err := moduleTxn.AssignModulesToOrderItem(orderItem, availableModules); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "冷链箱分配失败"})
			return false
		}
	}
	return true
}

func (c *OrderController) AcceptOrder(ctx *gin.Context) {
	orderID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "无效的订单ID"})
		return
	}
	err = c.orderRepo.Transaction(func(tx *gorm.DB) error {
		orderTxn := dao.NewOrderRepository(tx)
		order, err := orderTxn.GetOrderByID(uint(orderID))
		if err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "订单不存在"})
			return err
		}

		StatusName, err := orderTxn.GetOrderStatusName(order.StatusID)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取订单状态失败"})
			return err
		}

		if StatusName != "已支付" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "订单状态不允许接收"})
			return err
		}

		StatusID, err := orderTxn.GetOrderStatusIDByName("已审核")
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取订单状态失败"})
			return err
		}

		if err := orderTxn.UpdateStatus(order.ID, StatusID); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "更新订单失败"})
			return err
		}

		if !c.AllocateColdChainModules(ctx, tx, order.OrderItems) {
			return fmt.Errorf("冷链模块分配失败")
		}
		return nil
	})
	if err != nil {
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "订单已接收"})
}

func (c *OrderController) RejectOrder(ctx *gin.Context) {
	orderID, err := strconv.Atoi(ctx.Param("id"))
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "无效的订单ID"})
		return
	}
	err = c.orderRepo.Transaction(func(tx *gorm.DB) error {
		orderTxn := dao.NewOrderRepository(tx)
		order, err := orderTxn.GetOrderByID(uint(orderID))
		if err != nil {
			ctx.JSON(http.StatusNotFound, gin.H{"error": "订单不存在"})
			return err
		}

		StatusName, err := orderTxn.GetOrderStatusName(order.StatusID)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取订单状态失败"})
			return err
		}

		if StatusName != "已支付" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "订单状态不允许拒绝"})
			return err
		}

		StatusID, err := orderTxn.GetOrderStatusIDByName("已驳回")
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取订单状态失败"})
			return err
		}

		if err := orderTxn.UpdateStatus(order.ID, StatusID); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "更新订单失败"})
			return err
		}
		return nil
	})
	if err != nil {
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "订单已驳回"})
}

func (c *OrderController) PayOrder(ctx *gin.Context) {
	var req dto.PayOrderRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "请求参数错误"})
		return
	}

	payedStatusID, err := c.orderRepo.GetOrderStatusIDByName("已支付")
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "获取订单状态失败"})
		return
	}

	err = c.orderRepo.UpdateStatus(req.OrderID, payedStatusID)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "更新订单状态失败"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "订单已支付"})
}
