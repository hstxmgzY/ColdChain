export default interface ModuleType {
    id: number
    device_id: string
    settingTemperature: number
    status: string
    isEnabled: boolean
}

export interface AddModuleRequest {
    device_id: string
}