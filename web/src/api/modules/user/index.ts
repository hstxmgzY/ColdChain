import { http } from "../../request"
import type { UserType } from "../../../interface/user/user"

export const getUserList = async (): Promise<UserType[]> => {
    const response = await http.get<UserType[]>('/user/list')
    return response.data
}

export const addUser = (userData: { username: string; password: string; role: string; phone: string }) => {
    return http.post('/user/add',userData)
}

export const updateUser = (userId: number, updatedData: { username?: string; password?: string; role?: string; phone?: string }) => {
    return http.put(`/user/update/${userId}`, updatedData)
}

export const deleteUser = async (userId: number) => {
    const response = await http.delete(`/user/delete/${userId}`)
    console.log("deleteUser API 返回数据：", response)
    return response
}