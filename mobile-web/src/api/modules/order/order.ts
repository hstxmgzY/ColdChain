import { http } from "../../request"
import { OrderType } from "../../../interface/order/order"

export const getOrderList = async (status?: string) => {
    const response = await http.get<OrderType[]>("/orders/list", {
        params: status ? { status } : {},
    })
    return response
}

// 创建订单
export const createOrder = async (orderData: Partial<OrderType>) => {
    return await http.post<OrderType>("/orders/create", orderData)
}

// 更新订单
export const updateOrder = async (
    id: number,
    updatedData: Partial<OrderType>
) => {
    return await http.put<OrderType>(`/orders/update/${id}`, updatedData)
}

// 删除订单
export const deleteOrder = async (id: number) => {
    return await http.delete(`/orders/delete/${id}`)
}
