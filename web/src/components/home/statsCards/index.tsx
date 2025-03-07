import React from 'react';
import { ReconciliationTwoTone, RedEnvelopeTwoTone, ProjectTwoTone } from '@ant-design/icons';
import { Col, Row } from 'antd';
import StatsCard from './statsCard';

// 或许可以改用Statistic-统计数值：https://ant-design.antgroup.com/components/statistic-cn

const statsData = [
    {
        title: '今日使用冷链箱数量',
        icon: <ProjectTwoTone />,
        count: 99
    },
    {
        title: '今日订单总数量',
        icon: <ReconciliationTwoTone />,
        count: 99
    },
    {
        title: '今日订单总金额（元）',
        icon: <RedEnvelopeTwoTone />,
        count: 99
    },
    {
        title: '本月使用冷链箱数量',
        icon: <ProjectTwoTone />,
        count: 99
    },
    {
        title: '本月订单总数量',
        icon: <ReconciliationTwoTone />,
        count: 99
    },
    {
        title: '本月订单总金额（元）',
        icon: <RedEnvelopeTwoTone />,
        count: 99
    },
]

const StatsCards: React.FC = () => (
    <>
        <Row gutter={16} style={{ marginBottom: 16 }}>
            <Col span={8}>
                <StatsCard data={statsData[0]}/>
            </Col>
            <Col span={8}>
                <StatsCard data={statsData[1]} />
            </Col>
            <Col span={8}>
                <StatsCard data={statsData[2]} />
            </Col>
        </Row>
        <Row gutter={16}>
            <Col span={8}>
                <StatsCard data={statsData[3]} />
            </Col>
            <Col span={8}>
                <StatsCard data={statsData[4]} />
            </Col>
            <Col span={8}>
                <StatsCard data={statsData[5]} />
            </Col>
        </Row>
    </>

);

export default StatsCards;