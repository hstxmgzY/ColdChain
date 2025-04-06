export interface AlarmInfoType {
    id: number // 主键(警报ID)
    module_id: string // 冷链ID
    // module_name: string // 冷链名称
    device_id: number // 设备物理ID
    alarm_time: string // 报警时间
    alarm_type: string // 报警类型
    alarm_description: string // 报警描述
    alarm_level: "紧急" | "重要" | "一般" // 报警级别
    alarm_status: "已读" | "暂不处理" | "未读"// 处理状态
    remark: string // 备注
}