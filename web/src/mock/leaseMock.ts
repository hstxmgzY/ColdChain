import Mock from "mockjs"
import { LeaseType } from "../interface/order/lease"

// 订单状态列表
const orderStatus = ["待支付", "已支付", "已审核", "已发货", "已完成", "已取消"]

// 生成模拟订单数据
const leaseList = Mock.mock({
    "data|20": [
        {
            "id|+1": 1,
            order_number: "@string('number', 10)", // 10位订单编号
            status:
                "@pick([" + orderStatus.map((s) => `"${s}"`).join(",") + "])",
            price: "@float(100, 1000, 2, 2)", // 价格范围100-1000，保留2位小数
            create_time: "@datetime",
            delivery_time: "@datetime",
            finish_time: "@datetime",
            sender_address: "@county(true)",
            sender_name: "@cname",
            sender_phone: /^1[3456789]\d{9}$/,
            receiver_address: "@county(true)",
            receiver_name: "@cname",
            receiver_phone: /^1[3456789]\d{9}$/, // 随机生成手机号码
            order_note: "@csentence(10, 20)", // 订单备注，10-20个字
        },
    ],
}).data

// 模拟获取订单列表接口
Mock.mock(/\/api\/order\/lease\/list/, "get", () => {
    return {
        code: 200,
        message: "获取成功",
        data: leaseList,
    }
})

// 模拟添加订单接口
Mock.mock(/\/api\/order\/lease\/add/, "post", (options) => {
    const newLease = JSON.parse(options.body)
    newLease.id = Mock.Random.guid()
    leaseList.push(newLease)
    return {
        code: 200,
        message: "添加成功",
        data: newLease,
    }
})

// 模拟更新订单接口
Mock.mock(/\/api\/order\/lease\/update\/\w+/, "put", (options) => {
    const { id, ...updatedData } = JSON.parse(options.body)
    const index = leaseList.findIndex((item: LeaseType) => item.id === id)
    if (index !== -1) {
        leaseList[index] = { ...leaseList[index], ...updatedData }
        return { code: 200, message: "更新成功", data: leaseList[index] }
    } else {
        return { code: 404, message: "订单不存在" }
    }
})

// 模拟删除订单接口
Mock.mock(/\/api\/order\/lease\/delete\/\w+/, "delete", (options) => {
    const id = options.url.split("/").pop()
    const index = leaseList.findIndex(
        (item: LeaseType) => item.id === Number(id)
    )
    if (index !== -1) {
        leaseList.splice(index, 1)
        return { code: 200, message: "删除成功" }
    } else {
        return { code: 404, message: "订单不存在" }
    }
})
