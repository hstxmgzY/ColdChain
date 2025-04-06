# 冷链模块管理系统前台小程序

## 项目背景

这是一个给用户使用的冷链模块管理系统前台小程序，用户可以通过小程序提交订单，租赁冷链箱，对冷链模块路径、电量、温度等情况进行查看，若送达则可确认收货和评价。请您基于目前的情况，进行开发。

## 功能

### 用户登录与注册

### 个人信息管理
登陆后，信息存在store中
通过后端接口：
``` go
	// 用户路由组
	userGroup := r.Group("/api/user")
	{
		userGroup.GET("/list", userCtrl.GetUsers)
		userGroup.POST("/add", userCtrl.CreateUser)
		userGroup.GET("/:id", userCtrl.GetUserByID)
		userGroup.PUT("/update/:id", userCtrl.UpdateUser)
		userGroup.DELETE("/delete/:id", userCtrl.DeleteUser)
		userGroup.POST("/login", userCtrl.Login)
		userGroup.GET("/captcha", userCtrl.CaptchaGenerate)
	}
```
中的/api/user/:id获取。

可以修改，更新个人信息：

个人信息包括：
1. 个人头像（根据首字母自动生成）
2. UserName
3. Phone
4. RoleName
5. 地址。
   1. 其中，地址有多条，返回类型为json数组格式，如'[
    {"name": "赵六", "phone": "13844445555", "detail": "深圳市福田区华强北300号"},
    {"name": "赵六", "phone": "13844445555", "detail": "深圳市南山区科技园400号"}
]'，需要每条都显示，并且可以通过userGroup.PUT("/update/:id", userCtrl.UpdateUser)这个api修改，新增与删除，可以参考：
```ts
export const updateUser = (
    userId: number,
    updatedData: {
        username?: string
        role?: string
        phone?: string
        address?: object[]
    }
) => {
    const response = http.put(`/user/update/${userId}`, updatedData)
    return response
}

    const handleAddressSubmit = async () => {
        try {
            const values = await addressForm.validateFields()
            const newAddress = {
                name: values.name,
                phone: values.phone,
                detail: values.detail,
            }

            let newAddresses = [...currentAddresses]

            if (editingAddress) {
                // 使用唯一标识符查找地址（临时用phone+detail组合）
                const index = currentAddresses.findIndex(
                    (a) =>
                        a.phone === editingAddress.phone &&
                        a.detail === editingAddress.detail
                )

                if (index === -1) {
                    message.error("未找到要修改的地址")
                    return
                }

                // 创建新数组保证React状态更新
                newAddresses = newAddresses.map((item, i) =>
                    i === index ? newAddress : item
                )
            } else {
                newAddresses.push(newAddress)
            }

            await handleUpdateAddresses(newAddresses)
            console.log("提交的地址数据:", newAddresses) // 调试日志
            setIsEditingAddress(false)
            setEditingAddress(null)
            addressForm.resetFields() // 新增：提交后清空表单
        } catch (error) {
            console.error("地址提交错误:", error)
        }
    }


    const handleUpdateAddresses = async (newAddresses: Address[]) => {
        console.log("更新地址:", newAddresses) // 调试日志
        if (!editingUserAddress) {
            message.error("未找到相应用户信息")
            return
        }
        try {
            console.log("提交的地址数据:", newAddresses) // 调试日志
            const response = await updateUser(editingUserAddress.user_id, {
                address: newAddresses,
            })

            console.log("API响应:", response) // 调试日志

            if (response) {
                message.success("地址更新成功")
                setFilteredData((prev) =>
                    prev.map((user) =>
                        user.user_id === editingUserAddress.user_id
                            ? { ...user, address: newAddresses }
                            : user
                    )
                )
                setCurrentAddresses(newAddresses)
            } else {
                message.error(response || "地址更新失败")
            }
        } catch (error) {
            console.error("地址更新请求失败:", error)
            message.error("请求发送失败，请检查网络")
        }
    }
```




后端类型如下
``` go
type UserRole struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	RoleName string `gorm:"type:varchar(50);not null" json:"role_name"`
}

type User struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Username     string         `gorm:"type:varchar(50);not null" json:"username"`
	Phone        string         `gorm:"type:varchar(50);unique" json:"phone"`
	PasswordHash string         `gorm:"type:CHAR(60);not null" json:"password_hash"`
	RoleID       uint           `gorm:"type:int;not null" json:"role_id"`
	Role         UserRole       `gorm:"foreignKey:RoleID;references:ID"`
	Address      datatypes.JSON `gorm:"type:json" json:"address"`
	CreatedAt    time.Time      `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time      `gorm:"autoUpdateTime" json:"updated_at"`
	RentalOrders []RentalOrder  `gorm:"foreignKey:UserID" json:"rental_orders"`
}
```

### 租赁订单

创建订单： 

后端接口：
```go
	orderGroup := r.Group("/api/orders")
	{
		orderGroup.GET("/:id", orderCtrl.GetOrderDetail)
		orderGroup.GET("/list", orderCtrl.ListOrders)
		orderGroup.POST("/create", orderCtrl.CreateOrder)
		orderGroup.PUT("/update/:id", orderCtrl.UpdateOrder)
		orderGroup.POST("/accept/:id", orderCtrl.AcceptOrder)
		orderGroup.POST("/reject/:id", orderCtrl.RejectOrder)
		orderGroup.POST("/module", orderCtrl.AddModule)
	}
```
中的/api/orders/create

具体的我还没写好后端接口，您先预留一下，生成一个前端页面原型吧！

第一个页面：填写订单（Order）信息:上半部分包括：发件人地址（姓名手机号详细地址），收件人地址（姓名手机号详细地址） 注意，地址可以从用户的个人信息中获取，也可以手动填写。，在第一个页面的下半部分，包括选择一个一个的OrderItem，接下来进入第二个页面（OrderItem）。
第二个页面：填写每个OrderItem：选择商品类型（如：普通商品，医药商品、生鲜商品），填写商品数量，填写商品名称（如：苹果，香蕉，橙子），填写商品重量和体积，填写租赁冷链箱数量，每个不同的商品占一个orderItem，系统自动生成订单金额。
第三个页面：订单确认：包括订单号，订单总金额，订单状态，订单创建时间，订单完成时间，订单备注。
第四个页面：订单支付：包括订单号，订单总金额，订单状态，订单创建时间，订单完成时间，订单备注。


json结构如下所示：
```json
 {
        "id": 1,
        "order_number": "ORD001",
        "total_price": 100,
        "status_name": "待支付",
        "sender_info": {
            "name": "王五",
            "phone": "13833334444",
            "detail": "广州市天河区体育西路200号"
        },
        "receiver_info": {
            "name": "赵六",
            "phone": "13844445555",
            "detail": "深圳市福田区华强北300号"
        },
        "order_note": "Deliver ASAP",
        "user": {
            "username": "喻文州",
            "role_name": "manager"
        },
        "order_items": [
            {
                "id": 1,
                "quantity": 2,
                "unit_price": 50,
                "product": {
                    "id": 1,
                    "product_name": "Smartphone",
                    "category_name": "Electronics",
                    "max_temperature": 12,
                    "min_temperature": 6,
                    "spec_weight": 0.5,
                    "spec_volume": 0,
                    "image_url": "/images/smartphone.jpg"
                },
                "module": null
            }
        ]
    },
```

### 查看订单状态
具体的我还没写好后端接口，您先预留一下，生成一个前端页面原型吧！


点击查看订单状态，进入订单详情页面，包括订单号，订单总金额，订单状态，订单创建时间，订单完成时间，订单备注。
点击查看订单路径，可以查看订单所属的每个冷链箱的详细路径和冷链箱状态（温度、电量、故障情况、工作时长等）。
点击查看订单商品，可以查看订单所属的每个商品的详细信息。
点击查看订单备注，可以查看订单备注。

### 查看通知
具体的我还没写好后端接口，您先预留一下，生成一个前端页面原型吧！

点击查看通知，可以查看通知的详细信息，如故障，订单驳回，订单状态变化情况等。

### 确认收货与评价
具体的我还没写好后端接口，您先预留一下，生成一个前端页面原型吧！

点击确认收货，进入确认收货页面。
点击评价，进入评价页面。


## 文件夹目录

```
- src
  - api
    - request.ts 二次封装axios
    - order
    - user
    - alarmInfo
  - assets
  - components
    - notification
    - orders
      - createFlow
      - detail
      - list
      - payment
    - profile
  - config
  - context
    - UserContext.tsx
  - interface
  - pages
    - notification
    - orders
      - createFlow
      - detail
      - list
      - payment
    - profile
  - router
  - store
mian.tsx
App.tsx

```