import React, { useEffect, useRef } from "react"
import { Row, Col, Card } from "antd"
import * as echarts from "echarts"

// 模拟数据生成
const generateData = () => {
    const dates = []
    for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        dates.push(`${date.getMonth() + 1}/${date.getDate()}`)
    }

    return {
        workHours: dates.map(() => Math.floor(Math.random() * 6 + 4)),
        online: dates.map(() => Math.floor(Math.random() * 15 + 5)),
        offline: dates.map(() => Math.floor(Math.random() * 5)),
        faults: [
            { name: "A", value: Math.floor(Math.random() * 20) },
            { name: "B", value: Math.floor(Math.random() * 15) },
            { name: "C", value: Math.floor(Math.random() * 10) },
            { name: "D", value: Math.floor(Math.random() * 8) },
            { name: "E", value: Math.floor(Math.random() * 5) },
            { name: "F", value: Math.floor(Math.random() * 3) },
            { name: "其他", value: Math.floor(Math.random() * 10) },
        ],
    }
}

const ColdModuleStats = () => {
    const chart1 = useRef<echarts.ECharts>()
    const chart2 = useRef<echarts.ECharts>()
    const chart3 = useRef<echarts.ECharts>()
    const container1 = useRef<HTMLDivElement>(null)
    const container2 = useRef<HTMLDivElement>(null)
    const container3 = useRef<HTMLDivElement>(null)
    const data = generateData()

    useEffect(() => {
        // 初始化图表
        chart1.current = echarts.init(container1.current!)
        chart2.current = echarts.init(container2.current!)
        chart3.current = echarts.init(container3.current!)

        // 使用时长配置
        chart1.current.setOption({
            title: { text: "每日工作时长统计", left: "center" },
            tooltip: { trigger: "axis" },
            xAxis: {
                type: "category",
                data: generateData().workHours.map((_, i) => `${i + 1}日`),
            },
            yAxis: { type: "value", name: "小时" },
            series: [
                {
                    data: data.workHours,
                    type: "line",
                    smooth: true,
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: "#1890ff" },
                            { offset: 1, color: "#e6f7ff" },
                        ]),
                    },
                    lineStyle: { color: "#1890ff" },
                },
            ],
        })

        // 在线状态配置
        chart2.current.setOption({
            title: { text: "设备在线状态统计", left: "center" },
            tooltip: { trigger: "axis" },
            legend: { data: ["在线", "离线"], top: 30 },
            xAxis: {
                type: "category",
                data: generateData().workHours.map((_, i) => `${i + 1}日`),
            },
            yAxis: { type: "value", name: "数量" },
            series: [
                {
                    name: "在线",
                    data: data.online,
                    type: "line",
                    smooth: true,
                    color: "#52c41a",
                },
                {
                    name: "离线",
                    data: data.offline,
                    type: "line",
                    smooth: true,
                    color: "#ff4d4f",
                },
            ],
        })

        // 故障统计配置
        chart3.current.setOption({
            title: { text: "设备故障类型分布", left: "center" },
            tooltip: { trigger: "item" },
            legend: { orient: "vertical", left: "left" },
            series: [
                {
                    type: "pie",
                    radius: "60%",
                    data: data.faults,
                    label: { formatter: "{b}: {d}%" },
                    itemStyle: {
                        borderRadius: 5,
                        borderColor: "#fff",
                        borderWidth: 2,
                    },
                    emphasis: { itemStyle: { shadowBlur: 10 } },
                },
            ],
        })

        // 响应式调整
        const resizeHandler = () => {
            chart1.current?.resize()
            chart2.current?.resize()
            chart3.current?.resize()
        }
        window.addEventListener("resize", resizeHandler)

        return () => {
            window.removeEventListener("resize", resizeHandler)
            chart1.current?.dispose()
            chart2.current?.dispose()
            chart3.current?.dispose()
        }
    }, [])

    return (
        <div>
            <Row gutter={[16, 16]}>
                <Col span={24}>
                    <Card>
                        <div
                            ref={container1}
                            style={{ height: 300, width: "100%" }}
                        />
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card>
                        <div
                            ref={container2}
                            style={{ height: 300, width: "100%" }}
                        />
                    </Card>
                </Col>

                <Col xs={24} md={12}>
                    <Card>
                        <div
                            ref={container3}
                            style={{ height: 300, width: "100%" }}
                        />
                    </Card>
                </Col>
            </Row>
        </div>
    )
}

export default ColdModuleStats
