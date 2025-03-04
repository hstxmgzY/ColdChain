import { LeaseType } from "../../../interface/order/lease"
import { http } from "../../request"

export const getLeaseList = async (): Promise<LeaseType[]> => {
    const response = await http.get<LeaseType[]>('/order/lease/list')
    return response.data
}

export const addLease = (leaseData:LeaseType) => {
    return http.post('/order/lease/add',leaseData)
}

export const updateLease = (leaseId: number, updatedData: LeaseType) => {
    return http.put(`/order/lease/update/${leaseId}`, updatedData)
}

export const deleteLease = async (leaseId: number) => {
    return http.delete(`/order/lease/delete/${leaseId}`)
}
