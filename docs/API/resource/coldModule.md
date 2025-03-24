### 接口文档

#### 基础信息
- **Base URL**: `/api`
- **数据格式**: JSON

---

### 1. 产品管理接口

#### 1.1 获取产品列表
- **URL**: `/products`
- **方法**: GET
- **参数**:
  - `category` (可选): 过滤类别 (`medical`|`fresh`|`general`)
- **响应示例**:
  ```json
  [
    {
      "id": 1,
      "productName": "巧乐兹",
      "category": "medical",
      "weight": 0.5,
      "volume": 0.1
    }
  ]
  ```

#### 1.2 创建产品
- **URL**: `/products`
- **方法**: POST
- **请求体**:
  ```json
  {
    "productName": "高端冰淇淋",
    "category": "fresh",
    "weight": 0.4,
    "volume": 0.15
  }
  ```
- **响应**: 返回创建的产品对象

---

### 2. 订单管理接口

#### 2.1 创建订单
- **URL**: `/orders`
- **方法**: POST
- **请求体**:
  ```json
  {
    "productId": 1,           // 关联产品ID
    "receiverAddress": "xxx", // 必填字段参考LeaseType
    // 其他订单字段...
  }
  ```
- **响应**: 返回创建的订单对象

#### 2.2 获取订单列表
- **URL**: `/orders`
- **方法**: GET
- **参数**:
  - `status` (可选): 订单状态过滤
- **响应**: LeaseType 数组

---

### 3. 冷链模块管理接口

#### 3.1 获取冷链模块列表
- **URL**: `/cold-modules`
- **方法**: GET
- **参数**:
  - `status` (可选): `待分配`|`已分配`
  - `isEnabled` (可选): `true`|`false`
- **响应示例**:
  ```json
  [
    {
      "id": "CM001",
      "deviceId": "D123",
      "temperature": -5.5,
      "status": "待分配",
      "isEnabled":true,
      "product": { /* ProductType 对象 */ },
      "leaseId": 1001
    }
  ]
  ```

#### 3.2 添加冷链模块
- **URL**: `/cold-modules`
- **方法**: POST
- **请求体**:
  ```json
  {
    "deviceId": "D124",       // 设备物理ID（唯一）
    "minTemperature": -20,
    "maxTemperature": 10,
    "volume": 2.5
  }
  ```
- **响应**: 返回创建的冷链模块对象

---

## 数据库设计（符合三范式）

### 1. 产品表 (`product`)

| 字段名       | 类型         | 说明                     |
|--------------|--------------|--------------------------|
| id           | INT PRIMARY  | 产品ID                   |
| product_name | VARCHAR(255) | 产品名称                 |
| category     | ENUM         | 类型: medical/fresh/general |
| weight       | DECIMAL      | 重量(kg)                |
| volume       | DECIMAL      | 体积(m³)                |

---

### 2. 订单表 (`lease_order`)

| 字段名            | 类型         | 说明                     |
|-------------------|--------------|--------------------------|
| id                | INT PRIMARY  | 订单ID                   |
| order_number      | VARCHAR(255) | 订单编号（唯一）         |
| status            | ENUM         | 订单状态（6种）          |
| price             | DECIMAL      | 价格                     |
| create_time       | DATETIME     | 创建时间                 |
| delivery_time     | DATETIME     | 取货时间                 |
| finish_time       | DATETIME     | 完成时间                 |
| sender_address    | VARCHAR(255) | 发货地址                 |
| sender_name       | VARCHAR(255) | 寄件人姓名               |
| sender_phone      | VARCHAR(20)  | 寄件人电话               |
| receiver_address  | VARCHAR(255) | 收货地址                 |
| receiver_name     | VARCHAR(255) | 收货人姓名               |
| receiver_phone    | VARCHAR(20)  | 收货人电话               |
| order_note        | TEXT         | 订单备注                 |

---

### 3. 冷链模块表 (`cold_module`)

| 字段名           | 类型         | 说明                     |
|------------------|--------------|--------------------------|
| id               | VARCHAR(255) PRIMARY | 冷链箱编号       |
| device_id        | VARCHAR(255) UNIQUE  | 设备物理ID       |
| min_temperature  | DECIMAL      | 最低温度设置     |
| max_temperature  | DECIMAL      | 最高温度设置     |
| temperature      | DECIMAL      | 当前温度         |
| battery          | DECIMAL      | 电池电量(%)      |
| working_time     | DECIMAL      | 工作时间(小时)   |
| status           | ENUM         | 待分配/已分配    |
| is_enabled       | BOOLEAN      | 是否启用          |
| volume           | DECIMAL      | 容量(m³)          |
| lease_id         | INT          | 外键关联订单表    |
| product_id       | INT          | 外键关联产品表    |

**外键约束**:
- `lease_id` REFERENCES `lease_order(id)`
- `product_id` REFERENCES `product(id)`

---

### 4. 订单-产品关联表 (`order_product`)（可选）

| 字段名       | 类型        | 说明               |
|--------------|-------------|--------------------|
| order_id     | INT         | 外键关联订单表     |
| product_id   | INT         | 外键关联产品表     |
| quantity     | INT         | 商品数量           |

**说明**: 如果订单支持多商品，需添加此表实现多对多关系。

---

### 范式验证
1. **第一范式**：所有字段均为原子值
2. **第二范式**：所有非主键字段完全依赖主键
3. **第三范式**：消除传递依赖（如地址信息直接属于订单，无冗余）