import { http } from "../../request9998" // 如果新接口使用新端口对应的 API 文件，例如 request9998.ts，就改为 "../../request9998"

/**
 * 定义温度数据类型
 * 根据后端返回的数据结构进行调整
 */
export type TemperatureData = {
    temperature: number         // 当前温度值
    device_id: string            // 设备ID
    battery_level:number         // 电池电量
}

/**
 * 定义报警数据类型
 */
export type AlarmData = {
    device_id: string            // 设备ID
    alarm_level: string         // 报警等级
    alarm_status:string        // 报警状态
    remark: string             // 备注
    timestamp: string           // 报警时间戳
    alarm_description: string   // 报警描述
}

/**
 * 获取温度数据列表
 * 接口：GET /api/monitor/temperature/list
 */
export const getTemperatureList = async () => {
    const response = await http.get<TemperatureData[]>("/monitor/temperature/list")
    return response
}

/**
 * 获取某个设备的报警数据
 * 接口：GET /api/monitor/alarm/:deviceID
 * @param deviceID 设备的唯一标识
 */
export const getMonitorAlarm = async (deviceID: string) => {
    const response = await http.get<AlarmData>(`/monitor/alarm/${deviceID}`)
    return response
}

export const getMonitorAlarmList = async () => {
    const response = await http.get<AlarmData[]>("/monitor/alarm")
    console.log(response)
    return response
}