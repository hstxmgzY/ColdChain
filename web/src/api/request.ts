import axios, { AxiosError, AxiosRequestConfig, Method } from "axios"
import { message } from "antd"

const service = axios.create({
    baseURL: "http://localhost:9999/api",
    timeout: 3000,
    withCredentials: false,
})

/**
 * 请求拦截器
 *  - 处理 token 等全局请求头
 */

service.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token") //如果要改成store的话要改一下（之后完善）
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

/**
 * 响应拦截器
 *  - 处理全局错误码
 *  - 压缩响应数据
 */

service.interceptors.response.use(
    (response) => {
        const res = response.data
        return res
    },
    (error: AxiosError) => {
        const status = error.response?.status
        let errMessage = "请求失败"
        if (status) {
            switch (status) {
                case 401:
                    errMessage = "身份认证失败"
                    break
                case 403:
                    errMessage = "拒绝访问"
                    break
                case 404:
                    errMessage = "资源不存在"
                    break
                case 500:
                    errMessage = "服务器错误"
                    break
                default:
                    errMessage = `网络请求错误 (${status})`
            }
        } else if (error.code === "ECONNABORTED") {
            errMessage = "请求超时"
        } else if (error.message.includes("Network Error")) {
            errMessage = "网络连接失败"
        }

        // message.error(errMessage)
        return Promise.reject(error)
    }
)

type Data<T> = {
    code: number
    message: string
    data: T
}

const request = <T>(
    url: string,
    method: Method,
    submitData?: object,
    config?: AxiosRequestConfig
) => {
    return service.request<T, Data<T>>({
        url,
        method,
        [method.toLowerCase() === "get" ? "params" : "data"]: submitData,
        ...config, //剩余参数
    })
}

/**
 * 封装常用方法
 */
export const http = {
    get: <T>(url: string, params?: object, config?: AxiosRequestConfig) =>
        request<T>(url, "GET", params, config),

    post: <T>(url: string, data?: object, config?: AxiosRequestConfig) =>
        request<T>(url, "POST", data, config),
    put: <T>(url: string, data?: object, config?: AxiosRequestConfig) =>
        request<T>(url, "PUT", data, config),

    delete: <T>(url: string, params?: object, config?: AxiosRequestConfig) =>
        request<T>(url, "DELETE", params, config),
}

export default request
