import React from "react"
import { Col, Row, Card, List, Image, Typography, Divider } from "antd"
import { ClockCircleOutlined, EnvironmentOutlined } from "@ant-design/icons"
import VehicleImgUrl from "../../../../assets/images/detailRoute.png"

const { Title, Text } = Typography

const data = [
    {
        id: 1,
        imageUrl: "https://via.placeholder.com/100", // 替换为实际图片
        sendTime: "2024-08-29 18:41:33",
        sendLocation: "浙江省宁波市鄞州区南部商务区浙江省宁波",
        receiveTime: "2024-08-29 19:03:10",
        receiveLocation: "浙江省宁波市鄞州区...",
        distance: "0km",
        duration: "21分钟",
        isDelivered: true,
    },
    {
        id: 2,
        imageUrl: "https://via.placeholder.com/100",
        sendTime: "2024-08-29 18:19:50",
        sendLocation: "浙江省宁波市政府府...",
        receiveTime: "2024-08-29 20:22:50",
        receiveLocation: "浙江省宁波市鄞州区...",
        distance: "1.14km",
        duration: "123分钟",
        isDelivered: false,
    },
]

const DetailRoute: React.FC = () => (
    <Row gutter={16} style={{ padding: 16 }}>
        {/* 左侧列表 */}
        <Col span={8}>
            <List
                dataSource={data}
                renderItem={(item) => (
                    <Card style={{ marginBottom: 16, borderRadius: 8 }}>
                        <Row gutter={16}>
                            <Col
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    marginBottom: 16,
                                }}
                            >
                                <Image width={140} src={VehicleImgUrl} />
                            </Col>
                            <Col flex="auto">
                                {/* 出发时间 */}
                                <Row align="middle">
                                    <span
                                        style={{
                                            width: 10,
                                            height: 10,
                                            backgroundColor: "green",
                                            borderRadius: "50%",
                                            display: "inline-block",
                                            marginRight: 8,
                                        }}
                                    />
                                    <ClockCircleOutlined
                                        style={{ marginRight: 5 }}
                                    />
                                    <Title
                                        level={5}
                                        style={{ marginBottom: 0 }}
                                    >
                                        {item.sendTime}
                                    </Title>
                                </Row>
                                <Text type="secondary">
                                    <EnvironmentOutlined
                                        style={{ marginRight: 5 }}
                                    />
                                    {item.sendLocation}
                                </Text>
                                <br />

                                {/* 送达时间 */}
                                <Row align="middle" style={{ marginTop: 8 }}>
                                    <span
                                        style={{
                                            width: 10,
                                            height: 10,
                                            backgroundColor: item.isDelivered
                                                ? "green"
                                                : "red",
                                            borderRadius: "50%",
                                            display: "inline-block",
                                            marginRight: 8,
                                        }}
                                    />
                                    <ClockCircleOutlined
                                        style={{ marginRight: 5 }}
                                    />
                                    <Title
                                        level={5}
                                        style={{ marginBottom: 0 }}
                                    >
                                        {item.receiveTime}
                                    </Title>
                                </Row>
                                <Text type="secondary">
                                    <EnvironmentOutlined
                                        style={{ marginRight: 5 }}
                                    />
                                    {item.receiveLocation}
                                </Text>
                                <br />
                                <Divider style={{ margin: "6px 0" }} />
                                {/* 行驶信息 */}
                                <Text type="secondary">
                                    🚗 行驶距离: {item.distance} | ⏳ 行驶时间:{" "}
                                    {item.duration}
                                </Text>
                            </Col>
                        </Row>
                    </Card>
                )}
            />
        </Col>

        {/* 右侧地图 */}
        <Col span={16}>
            <Card style={{ height: "100%", borderRadius: 8 }}>
                <div
                    style={{
                        height: "500px",
                        background: "#f0f2f5",
                        borderRadius: 8,
                    }}
                >
                    地图区域（可嵌入地图组件）
                </div>
            </Card>
        </Col>
    </Row>
)

export default DetailRoute
