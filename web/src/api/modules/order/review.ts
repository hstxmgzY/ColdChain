import { ReviewOrderType } from "../../../interface/order/review"
 import { http } from "../../request"
 
 // 获取审核订单列表（可选状态筛选）
 export const getAuditList = async (
     status?: string
 ): Promise<ReviewOrderType[]> => {
     const response = await http.get<ReviewOrderType[]>("/order/review/list", {
         params: status ? { status } : {}, // 仅在 status 存在时添加查询参数
     })
     return response.data
 }
 
 // 通过审核订单
 export const approveOrder = async (id: number): Promise<void> => {
     await http.post(`/orders/accept/${id}`)
 }
 
 // 驳回审核订单
 export const rejectOrder = async (id: number, reason: string) => {
     await http.post(`/orders/reject/${id}`, { reason })
 }