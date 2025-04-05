import React, { useEffect } from "react"
import { Col, Row } from "antd"
import PersonCard from "../../components/home/personCard"
import VehicleTable from "../../components/home/vehicleTable"
import StatsCards from "../../components/home/statsCards"
import MilesChart from "../../components/home/charts/milesChart"
import OrderChart from "../../components/home/charts/orderChart"

const Home = () => {
    return (
        <div>
            <Row gutter={30}>
                <Col span={8}>
                    <Row style={{ marginBottom: 16 }}>
                        <Col span={24}>
                            <PersonCard />
                        </Col>
                    </Row>
                    <Row>
                        <Col span={24}>
                            <VehicleTable />
                        </Col>
                    </Row>
                </Col>
                <Col span={16}>
                    <Row style={{ marginBottom: 16 }}>
                        <Col span={24}>
                            <StatsCards />
                        </Col>
                    </Row>
                    <Row gutter={16}>
                        <Col span={14}>
                            <MilesChart />
                        </Col>
                        <Col span={10}>
                            <OrderChart />
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    )
}

export default Home
