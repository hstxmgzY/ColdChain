import React, { useEffect, useState } from "react"
import {
    Row,
    Col,
    Button,
    Select,
    Space,
    Typography,
    Tabs,
    Modal,
    Form,
    InputNumber,
} from "antd"
import ColdModuleCard from "./coldModuleCard"
import ColdModuleTable from "./coldModuleTable"
import { ColdModuleType } from "../../../interface/resource/coldModule"

const { Text } = Typography

const mockProducts = [
    {
        id: 1,
        productName: "新冠疫苗",
        category: "medical",
        weight: 0.5,
        volume: 0.1,
    },
    {
        id: 2,
        productName: "海鲜刺身",
        category: "fresh",
        weight: 1.0,
        volume: 0.2,
    },
    {
        id: 3,
        productName: "干细胞样本",
        category: "medical",
        weight: 0.2,
        volume: 0.05,
    },
    {
        id: 4,
        productName: "医用试剂",
        category: "medical",
        weight: 0.3,
        volume: 0.1,
    },
    {
        id: 5,
        productName: "高端冰淇淋",
        category: "fresh",
        weight: 0.4,
        volume: 0.15,
    },
]

const generateMockData = (count: number) => {
    return Array.from({ length: count }, (_, i) => ({
        id: `CM${String(i + 1).padStart(3, "0")}`,
        minTemperature: Number((-20 + Math.random() * 25).toFixed(1)),
        maxTemperature: Number((-15 + Math.random() * 25).toFixed(1)),
        temperature: Number((-20 + Math.random() * 25).toFixed(1)),
        battery: Number((Math.random() * 100).toFixed(1)),
        workingTime: Number((Math.random() * 24).toFixed(1)),
        status: Math.random() > 0.5 ? "待分配" : "已分配",
        isEnabled: Math.random() > 0.3,
        volume: Number((0.5 + Math.random() * 4.5).toFixed(1)),
        product:
            Math.random() > 0.4
                ? mockProducts[Math.floor(Math.random() * mockProducts.length)]
                : undefined,
    }))
}

const ColdModuleManager = () => {
    const [mockData, setMockData] = useState<ColdModuleType[]>([])
    const [filteredData, setFilteredData] = useState<ColdModuleType[]>([])
    const [viewMode, setViewMode] = useState<"card" | "table">("card")
    const [selectedTab, setSelectedTab] = useState<string | null>(null)
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [form] = Form.useForm()

    useEffect(() => {
        const data = generateMockData(20)
        setMockData(data)
        setFilteredData(data)
    }, [])

    const handleTabChange = (key: string) => {
        const newTab = key === selectedTab ? null : key
        setSelectedTab(newTab)

        let filtered = mockData
        if (newTab) {
            filtered = filtered.filter((item) => item.status === newTab)
        }
        setFilteredData(filtered)
    }

    const handleSearch = (key: string, value: any) => {
        let filtered = mockData

        // 先筛选启用状态
        if (key === "isEnabled" && value !== undefined) {
            filtered = filtered.filter((item) => item.isEnabled === value)
        }

        // 再筛选 Tab 状态
        if (selectedTab) {
            filtered = filtered.filter((item) => item.status === selectedTab)
        }

        setFilteredData(filtered)
    }

    const handleAddModule = () => {
        form.validateFields().then((values) => {
            const newModule: ColdModuleType = {
                id: `CM${mockData.length + 1}`,
                ...values,
                status: "待分配",
                battery: 100,
                workingTime: 0,
                product: undefined,
            }
            const newData = [...mockData, newModule]
            setMockData(newData)
            setFilteredData(newData)
            setIsModalVisible(false)
            form.resetFields()
        })
    }

    const tabsItems = [
        { key: "待分配", label: "待分配" },
        { key: "已分配", label: "已分配" },
    ]

    return (
        <div>
            <Row
                justify="start"
                align="middle"
                gutter={[16, 16]}
                style={{ marginBottom: 16 }}
            >
                <Col span={8}>
                    <Button
                        type="primary"
                        onClick={() => setIsModalVisible(true)}
                    >
                        添加冷链模块
                    </Button>
                </Col>
                <Col span={8}>
                    <Space>
                        <Text>启用状态：</Text>
                        <Select
                            placeholder="全部状态"
                            onChange={(v) => handleSearch("isEnabled", v)}
                            style={{ width: 250 }}
                            allowClear
                        >
                            <Select.Option value={true}>在线</Select.Option>
                            <Select.Option value={false}>离线</Select.Option>
                        </Select>
                    </Space>
                </Col>
                <Col span={8} style={{ textAlign: "right" }}>
                    <Button
                        onClick={() =>
                            setViewMode(viewMode === "card" ? "table" : "card")
                        }
                    >
                        切换视图
                    </Button>
                </Col>
            </Row>
            <Tabs
                activeKey={selectedTab || ""}
                items={tabsItems}
                onChange={handleTabChange}
            />
            {viewMode === "card" ? (
                <ColdModuleCard data={filteredData} />
            ) : (
                <ColdModuleTable data={filteredData} />
            )}

            <Modal
                title="添加冷链模块"
                visible={isModalVisible}
                onOk={handleAddModule}
                onCancel={() => setIsModalVisible(false)}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="temperature"
                        label="温度"
                        rules={[{ required: true, message: "请输入温度" }]}
                    >
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                        name="volume"
                        label="容量"
                        rules={[{ required: true, message: "请输入容量" }]}
                    >
                        <InputNumber style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                        name="isEnabled"
                        label="启用状态"
                        rules={[{ required: true }]}
                    >
                        <Select>
                            <Select.Option value={true}>在线</Select.Option>
                            <Select.Option value={false}>离线</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    )
}

export default ColdModuleManager
