package controllers

import (
	"coldchain/common/jwt"
	"coldchain/common/mysql"
	"coldchain/common/mysql/models"
	"coldchain/server/dao"
	"coldchain/server/dto"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/mojocn/base64Captcha"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/datatypes"
	"gorm.io/gorm"
)

type UserController struct {
	userRepo *dao.UserRepository
}

// 修改控制器构造函数
func NewUserController(db *gorm.DB) *UserController {
	if db == nil {
		panic("NewUserController received nil DB instance")
	}
	return &UserController{
		userRepo: dao.NewUserRepository(mysql.Db),
	}
}

func (c *UserController) CaptchaGenerate(ctx *gin.Context) {
	height, _ := strconv.Atoi(ctx.DefaultQuery("height", "200"))
	width, _ := strconv.Atoi(ctx.DefaultQuery("width", "50"))

	captchaGen := base64Captcha.NewCaptcha(&base64Captcha.DriverDigit{
		Height:   height,
		Width:    width,
		Length:   4,
		MaxSkew:  0.2,
		DotCount: 1,
	}, base64Captcha.DefaultMemStore)

	id, b64s, _, err := captchaGen.Generate()
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "验证码生成失败"})
		return
	}

	ctx.JSON(http.StatusOK, dto.CaptchaResponse{
		Id:  id,
		Img: b64s,
	})
}

func (c *UserController) captchaVerify(id, ans string) bool {
	return base64Captcha.DefaultMemStore.Verify(id, ans, true)
}

func (c *UserController) Login(ctx *gin.Context) {
	var req dto.LoginRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := c.userRepo.GetUserByPhone(req.Phone)
	if err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "用户不存在"})
		return
	}

	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "密码错误"})
		return
	}

	if !c.captchaVerify(req.CaptchaID, req.CaptchaAnswer) {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "验证码错误"})
		return
	}

	auth, err := jwt.GenerateToken(uint32(user.ID), uint32(user.RoleID))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "生成token失败"})
		return
	}

	ctx.Header("Authorization", "Bearer "+auth)
	ctx.JSON(http.StatusOK, gin.H{"message": "登录成功", "user_id": user.ID, "role": user.Role.RoleName})
}

func (c *UserController) GetUserByID(ctx *gin.Context) {
	userID, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "无效的用户ID"})
		return
	}

	user, err := c.userRepo.GetUserWithRole(uint(userID))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	var addresses []dto.Address
	if err := json.Unmarshal(user.Address, &addresses); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "地址解析失败"})
		return
	}

	ctx.JSON(http.StatusOK, dto.UserResponse{
		ID:       user.ID,
		Username: user.Username,
		Role:     user.Role.RoleName,
		Phone:    user.Phone,
		Address:  addresses,
	})
}

// 处理用户列表
func (c *UserController) GetUsers(ctx *gin.Context) {
	page, _ := strconv.Atoi(ctx.DefaultQuery("page", "1"))
	size, _ := strconv.Atoi(ctx.DefaultQuery("size", "100"))

	users, err := c.userRepo.ListUsers(page, size)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var response []dto.UserResponse
	for _, user := range users {
		var addresses []dto.Address
		if err := json.Unmarshal(user.Address, &addresses); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "地址解析失败"})
			return
		}

		response = append(response, dto.UserResponse{
			ID:       user.ID,
			Username: user.Username,
			Role:     user.Role.RoleName,
			Phone:    user.Phone,
			Address:  addresses,
		})
	}

	ctx.JSON(http.StatusOK, response)
}

// 处理用户创建
func (c *UserController) CreateUser(ctx *gin.Context) {
	var req dto.CreateUserRequest
	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// 序列化地址数据
	addressJSON, err := json.Marshal(req.Address)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "地址格式错误"})
		return
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "密码加密失败"})
		return
	}

	roleId, err := c.userRepo.GetRoleId(req.Role)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "错误角色名"})
		return
	}

	user := models.User{
		Username:     req.Username,
		Phone:        req.Phone,
		PasswordHash: string(hashedPassword),
		RoleID:       uint(roleId),
		Address:      datatypes.JSON(addressJSON), // 使用正确的JSON类型
	}

	if err := c.userRepo.CreateUser(&user); err != nil {
		if err == gorm.ErrDuplicatedKey {
			ctx.JSON(http.StatusConflict, gin.H{"error": "该用户已注册"})
		} else {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// 构造响应数据
	var addresses []dto.Address
	fmt.Printf("User Address JSON: %s\n", user.Address)
	if err := json.Unmarshal(user.Address, &addresses); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "地址解析失败"})
		return
	}

	ctx.JSON(http.StatusCreated, dto.UserResponse{
		ID:       user.ID,
		Username: user.Username,
		Role:     user.Role.RoleName,
		Phone:    user.Phone,
		Address:  addresses,
	})
}

// 处理用户更新
func (c *UserController) UpdateUser(ctx *gin.Context) {
	userID, _ := strconv.ParseUint(ctx.Param("id"), 10, 64)
	var req dto.UpdateUserRequest

	if err := ctx.ShouldBindJSON(&req); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	user, err := c.userRepo.GetUserWithRole(uint(userID))
	if err != nil {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "用户不存在"})
		return
	}

	// 更新字段处理
	if req.Username != nil {
		user.Username = *req.Username
	}
	if req.Password != nil {
		hashed, err := bcrypt.GenerateFromPassword([]byte(*req.Password), bcrypt.DefaultCost)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "密码加密失败"})
			return
		}
		user.PasswordHash = string(hashed)
	}
	if req.Role != nil {
		roleID, err := c.userRepo.GetRoleId(*req.Role)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "错误角色名"})
			return
		}
		user.Role.ID = uint(roleID)
		user.Role.RoleName = *req.Role
	}
	if req.Phone != nil {
		user.Phone = *req.Phone
	}
	if req.Address != nil {
		addressJSON, err := json.Marshal(*req.Address)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "地址格式错误"})
			return
		}
		user.Address = datatypes.JSON(addressJSON)
	}

	if err := c.userRepo.UpdateUser(user); err != nil {
		if err == gorm.ErrDuplicatedKey {
			ctx.JSON(http.StatusConflict, gin.H{"error": "有重复的记录"})
		} else {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		}
		return
	}

	// 解析地址用于响应
	var addresses []dto.Address
	if err := json.Unmarshal(user.Address, &addresses); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "地址解析失败"})
		return
	}

	ctx.JSON(http.StatusOK, dto.UserResponse{
		ID:       user.ID,
		Username: user.Username,
		Role:     user.Role.RoleName,
		Phone:    user.Phone,
		Address:  addresses,
	})
}

// 删除用户
func (c *UserController) DeleteUser(ctx *gin.Context) {
	userID, err := strconv.ParseUint(ctx.Param("id"), 10, 64)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "无效的用户ID"})
		return
	}

	if err := c.userRepo.DeleteUser(uint(userID)); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "删除用户失败"})
		return
	}

	ctx.JSON(http.StatusOK, gin.H{"message": "用户删除成功"})
}
