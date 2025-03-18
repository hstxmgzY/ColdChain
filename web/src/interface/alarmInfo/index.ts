export interface AlarmInfoType {
    id: number // 主键(警报ID)
    cold_chain_id: string // 冷链ID
    cold_chain_name: string // 冷链名称
    machine_id: number // 设备物理ID
    alarm_time: string // 报警时间
    alarm_type: string // 报警类型
    alarm_description: string // 报警描述
    alarm_level: "紧急" | "重要" | "一般" // 报警级别
    alarm_status: "已读" | "暂不处理" // 报警状态
    remark: string // 备注
}