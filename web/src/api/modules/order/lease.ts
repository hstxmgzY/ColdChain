import { http } from "../../request"

export const getLeaseList = () => {
    return http.get('/order/lease/list')
}

export const addLease = (userData: { username: string; password: string; role: string; phone: string }) => {
    return http.post('/order/lease/add',userData)
}

export const updateLease = (userId: number, updatedData: { username?: string; password?: string; role?: string; phone?: string }) => {
    return http.put(`/order/lease/update/${userId}`, updatedData)
}

export const deleteLease = async (userId: number) => {
    return http.delete(`/order/lease/delete/${userId}`)
}
