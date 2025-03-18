import React from "react"
import { Card, List, Tag, Typography, Button, Space, Divider } from "antd"
import { ColdModuleType } from "../../../interface/resource/coldModule"
import coldModuleImgUrl from "../../../assets/images/coldmodule.png"
import MoreAction from "./coldModuleDetail/MoreAction"
import DetailInfo from "./coldModuleDetail/DetailInfo"

const { Text } = Typography

interface ColdModuleCardProps {
    data: ColdModuleType[]
}

const ColdModuleCard: React.FC<ColdModuleCardProps> = ({ data }) => {
    return (
        <List
            grid={{ gutter: 16, column: 4 }}
            dataSource={data}
            renderItem={(item) => (
                <List.Item>
                    <Card
                        title={`冷链模块 ${item.id}`}
                        extra={
                            <Tag color={item.isEnabled ? "green" : "red"}>
                                {item.isEnabled ? "在线" : "离线"}
                            </Tag>
                        }
                        style={{
                            borderRadius: 8,
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                        }}
                    >
                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                marginBottom: 18,
                            }}
                        >
                            <img
                                src={coldModuleImgUrl}
                                style={{ marginRight: 10, width: "50px" }}
                            />
                            <div>
                                <Text strong>工作时间: </Text>
                                <br />
                                {item.workingTime}小时
                            </div>
                            <Tag
                                color={
                                    item.status === "待分配" ? "blue" : "purple"
                                }
                            >
                                {item.status}
                            </Tag>
                        </div>

                        <div
                            style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginBottom: 8,
                                color:
                                    item.maxTemperature > 5
                                        ? "#cf1322"
                                        : "inherit",
                            }}
                        >
                            <div>
                                <Text strong>当前温度: </Text>
                                {item.temperature}℃
                            </div>
                            <div>
                                <Text strong>电量: </Text>
                                {item.battery}%
                            </div>
                        </div>
                        <Divider style={{ margin: "18px 10px" }} />
                        <Space>
                            <Button
                                type="link"
                                size="small"
                                onClick={() => console.log("设备轨迹", item.id)}
                            >
                                设备轨迹
                            </Button>
                            <DetailInfo />
                            <MoreAction />
                        </Space>
                    </Card>
                </List.Item>
            )}
        />
    )
}

export default ColdModuleCard
