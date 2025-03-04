import Mock from "mockjs"
import { UserType } from "../interface/user/user"

// 模拟用户数据
const userList:UserType[] = Mock.mock({
    "users|10-20": [
        {
            "user_id|+1": 1,
            username: "@first",
            password: "@string(10)",
            "role|1": ["admin", "manager", "user"],
            phone: /1[3-9]\d{9}/,
        },
    ],
}).users

// 获取用户列表
Mock.mock(/\/api\/user\/list/, "get", () => {
    return {
        code: 200,
        message: "获取成功",
        data: userList,
    }
})

// 添加用户
Mock.mock(/\/api\/user\/add/, "post", (options) => {
    const { username, password, role, phone } = JSON.parse(options.body)
    const newUser = {
        user_id: userList.length + 1,
        username,
        password: password || "default_password",
        role,
        phone,
    }
    userList.push(newUser)
    return { 
        code: 200,
        message: "用户添加成功",
        data: newUser,
    }
})

// 更新用户
Mock.mock(/\/api\/user\/update/, "put", (options) => {
    const { user_id, username, role, phone, password } = JSON.parse(
        options.body
    )
    const user = userList.find((u: UserType) => u.user_id === user_id)
    if (user) {
        user.username = username
        user.role = role
        user.phone = phone
        user.password = password || user.password
        return {
            code: 200,
            message: "用户更新成功",
            data: user,
        }
    } else {
        return {
            code: 404,
            message: "用户不存在",
        }
    }
})

Mock.mock(/\/api\/user\/delete\/\d+/, "delete", (options) => {
    console.log("Mock 拦截到请求：", options)

    const match = options.url.match(/\/api\/user\/delete\/(\d+)/)
    if (!match) {
        return { data: { code: 400, message: "无效的请求" } }
    }

    const user_id = Number(match[1])
    console.log("提取的 user_id:", user_id)

    const index = userList.findIndex((u: UserType) => u.user_id === user_id)

    if (index !== -1) {
        userList.splice(index, 1)
        console.log("👩")
        return { data: { code: 200, message: "用户删除成功" } }
    } else {
        return { data: { code: 404, message: "用户不存在" } }
    }
})
