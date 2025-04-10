package dao

import (
	"coldchain/common/logger"
	"coldchain/common/mysql/models"
	"errors"
	"strings"

	"gorm.io/gorm"
)

var (
	err error
)

type UserRepository struct {
	db *gorm.DB
}

// 修改仓库构造函数
func NewUserRepository(db *gorm.DB) *UserRepository {
	return &UserRepository{db: db} // 传递外部 db 实例
}

func (r *UserRepository) GetUserByID(userID uint) (*models.User, error) {
	var user models.User
	if err := r.db.First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) { // GORM v2 使用 errors.Is()
			return nil, errors.New("用户不存在")
		}
		return nil, err
	}
	return &user, nil
}

func (r *UserRepository) GetUserByPhone(phone string) (*models.User, error) {
	var user models.User
	if err := r.db.Where("phone = ?", phone).First(&user).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) { // GORM v2 使用 errors.Is()
			return nil, errors.New("用户不存在")
		}
		return nil, err
	}
	return &user, nil
}

// 获取带角色的用户
func (r *UserRepository) GetUserWithRole(userID uint) (*models.User, error) {
	var user models.User
	if err := r.db.Preload("Role").First(&user, userID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) { // GORM v2 使用 errors.Is()
			return nil, errors.New("用户不存在")
		}
		return nil, err
	}
	return &user, nil
}

// 创建用户
func (r *UserRepository) CreateUser(user *models.User) error {
	if err := r.db.Create(user).Error; err != nil {
		logger.Error(map[string]interface{}{
			"error":  err.Error(),
			"method": "CreateUser",
			"params": user,
		})
		return handleDBError(err)
	}
	return nil
}

func (r *UserRepository) GetRoleId(role_name string) (int, error) {
	var role_id int
	if err := r.db.Table("user_roles").
		Select("id").
		Where("role_name = ?", role_name).
		Scan(&role_id).Error; err != nil {
		logger.Error(map[string]interface{}{
			"error":  err.Error(),
			"method": "GetRoleId",
			"params": role_name,
		})
		return 0, handleDBError(err)
	}
	return role_id, nil
}

// 更新用户
func (r *UserRepository) UpdateUser(user *models.User) error {
	if err := r.db.Save(user).Error; err != nil {
		if strings.Contains(err.Error(), "Duplicate entry") {
			return gorm.ErrDuplicatedKey
		} else {
			logger.Error(map[string]interface{}{
				"error":  err.Error(),
				"method": "UpdateUser",
				"params": user,
			})
			return handleDBError(err)
		}
	}
	return nil
}

// 删除用户
func (r *UserRepository) DeleteUser(userID uint) error {
	if err := r.db.Delete(&models.User{}, userID).Error; err != nil {
		logger.Error(map[string]interface{}{
			"error":  err.Error(),
			"method": "DeleteUser",
			"userID": userID,
		})
		return handleDBError(err)
	}
	return nil
}

// 用户列表
func (r *UserRepository) ListUsers(page, size int) ([]models.User, error) {
	var users []models.User
	err := r.db.Preload("Role").
		Offset((page - 1) * size).
		Limit(size).
		Find(&users).Error

	if err != nil {
		logger.Error(map[string]interface{}{
			"error":  err.Error(),
			"method": "ListUsers",
			"page":   page,
			"size":   size,
		})
		return nil, handleDBError(err)
	}
	return users, nil
}

// 处理数据库错误
func handleDBError(err error) error {
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return gorm.ErrRecordNotFound
	}
	if errors.Is(err, gorm.ErrDuplicatedKey) || strings.Contains(err.Error(), "Duplicate entry") {
		return gorm.ErrDuplicatedKey
	}
	return err
}
