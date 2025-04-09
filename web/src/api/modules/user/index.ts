import { http } from "../../request"
import type { UserType } from "../../../interface/user/user"


export const getUserList = async () => {
    const response = await http.get<UserType[]>("/user/list")
    return response
}

export const getUserById = async (userId: number) => {
    const response = await http.get<UserType>(`/user/${userId}`)
    return response
}

export const addUser = (userData: {
    username: string
    password: string
    role: string
    phone: string
    address?: object[]
}) => {
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

export const getUserInfo = async (userId: number) => {
    const response = await http.get<UserType>(`/user/${userId}`)
    return response
}

export const getCaptcha = async (height: number, width: number) => {
    const response = await http.get(
        `/user/captcha?height=${height}&width=${width}`
    )
    return response
}

export const login = async (userData: {
    phone: string
    password: string
    captcha_id: string
    captcha_answer: string
}) => {
    const response = await http.post("/user/login", userData)
    // console.log("login response", response)
    return response
}
