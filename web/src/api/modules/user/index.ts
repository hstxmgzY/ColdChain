import { http } from "../../request"

export const getUserList = () => {
    return http.get('/user/list')
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