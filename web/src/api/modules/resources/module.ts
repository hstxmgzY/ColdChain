import { AddModuleRequest } from "../../../interface/resource/module"
import { http } from "../../request"

export const getModuleList = async () => {
    const response = await http.get("/module/list")
    return response
}

export const addModule = async (data: AddModuleRequest) => {
    const response = await http.post("/module/create", data)
    return response
}