export default interface ModuleType {
    id: number
    device_id: string
    settingTemperature: number
    status: string
    is_enabled: boolean
}

export interface AddModuleRequest {
    device_id: string
}