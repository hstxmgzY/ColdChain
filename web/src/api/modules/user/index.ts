import { http } from "../../request"
import type { UserType } from "../../../interface/user/user"

export const getUserList = async ()=> {
    const response = await http.get<UserType[]>("/user/list")
    return response
}

export const addUser = (userData: {
    username: string
    password: string
    role: string
    phone: string
    address?: object[]
}) => {
    console.log(userData)
    return http.post("/user/add", userData)
}

export const updateUser = (
    userId: number,
    updatedData: {
        username?: string
        role?: string
        phone?: string
        address?: object[]
    }
) => {
    const response = http.put(`/user/update/${userId}`, updatedData)
    return response
}

export const deleteUser = async (userId: number) => {
    const response = await http.delete(`/user/delete/${userId}`)
    return response
}
