import { http } from "../../request"
import type { AlarmInfoType } from "../../../interface/alarmInfo"

/**
 * 获取报警信息列表
 */
export const getAlarmInfoList = async (): Promise<AlarmInfoType[]> => {
    const response = await http.get<AlarmInfoType[]>("/alarm/list")
    return response.data
}

/**
 * 新增报警信息
 * @param alarmData 排除 id 的报警信息实体
 */
export const addAlarmInfo = (alarmData: Omit<AlarmInfoType, "id">) => {
    return http.post("/alarm/add", alarmData)
}

/**
 * 更新报警信息
 * @param alarmId 报警ID
 * @param updatedData 可选的更新字段（排除 id）
 */
export const updateAlarmInfo = (
    alarmId: number,
    updatedData: Partial<Omit<AlarmInfoType, "id">>
) => {
    return http.put(`/alarm/update/${alarmId}`, updatedData)
}

/**
 * 删除报警信息
 * @param alarmId 报警ID
 */
export const deleteAlarmInfo = async (alarmId: number) => {
    const response = await http.delete(`/alarm/delete/${alarmId}`)
    console.log("deleteAlarm API 返回数据：", response)
    return response
}

// 在原有接口文件中追加以下内容

/**
 * 处理报警信息（更新状态和备注）
 * @param alarmId 报警ID
 * @param processData 处理参数
 */
export const processAlarm = (
    alarmId: number,
    processData: {
        alarm_status: "已读" | "暂不处理" | "未读"
        remark?: string
    }
) => {
    return http.post(`/alarm/process/${alarmId}`, processData)
}

// 类型增强（可选）
export type ProcessAlarmParams = Parameters<typeof processAlarm>[1]
