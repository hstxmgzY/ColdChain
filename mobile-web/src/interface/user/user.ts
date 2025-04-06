export interface UserType {
    user_id: number
    username: string
    password: string
    role: "admin" | "manager" | "individual" | "merchant"
    phone: string
    address: object[]
}

export interface Address {
    name: string
    phone: string
    detail: string
}

export interface UserState {
    userInfo: UserType
    isLogin: boolean
}

export interface LoginData {
    phone: string
    password: string
    captchaId: string
    captchaCode: string
}
export interface RegisterData {
    username: string
    password: string
    role: string
    phone: string
}

export interface CaptchaData {
    Id: string
    Img: string
}

export interface UserInfo {
    user_id: number
    username: string
    role: string
    phone: string
    address: Address[]
}
