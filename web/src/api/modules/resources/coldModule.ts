import { ColdModuleType } from "../../../interface/resource/coldModule"
import { http } from "../../request"

export const getColdModules = async (): Promise<ColdModuleType[]> => {
    const response = await http.get<ColdModuleType[]>(
        "/resource/coldModule/list"
    )
    return response.data
}

export const addColdModule = (moduleData: Omit<ColdModuleType, "id">) => {
    return http.post("/resource/coldModule/add", moduleData)
}

export const updateColdModule = (
    moduleId: string,
    updatedData: Partial<ColdModuleType>
) => {
    return http.put(`/resource/coldModule/update/${moduleId}`, updatedData)
}

export const deleteColdModule = async (moduleId: string) => {
    return http.delete(`/resource/coldModule/delete/${moduleId}`)
}
