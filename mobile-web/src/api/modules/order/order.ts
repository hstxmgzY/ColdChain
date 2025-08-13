import { http } from "../../request"
import { Order } from "../../../interface/order/order"

export const getOrderListByUserId = async (userId:number) => {
    const response = await http.get<Order[]>(`/orders/list/${userId}`)
    return response
}

export const getOrderDetail = (id: number) => {
    return http.get(`/orders/${id}`); 
};

// 创建订单
export const createOrder = async (orderData: Partial<Order>) => {
    return await http.post<Order>("/orders/create", orderData)
}

// 更新订单
export const updateOrder = async (
    id: number,
    updatedData: Partial<Order>
) => {
    return await http.put<Order>(`/orders/update/${id}`, updatedData)
}

// 删除订单
export const deleteOrder = async (id: number) => {
    return await http.delete(`/orders/delete/${id}`)
}


// 支付后更改订单状态
export const updatePaiedStatus = async (id: number) => {
    return await http.post<Order>(`/orders/pay/${id}`)
}