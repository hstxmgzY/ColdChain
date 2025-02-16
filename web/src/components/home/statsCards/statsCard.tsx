import React from 'react';
import { Card, Row, Col } from 'antd';

interface StatsCardProps {
    data: {
        title: string,
        icon: React.ReactNode,
        count: number,
    }
}

const StatsCard: React.FC<StatsCardProps> = (props) => (
    <Card
        size="small"
        title={props.data.title}
        extra={<a href="# " style={{color:'#3075f8'}}>More</a>}
        hoverable
    >
        <Row align="middle" justify="space-between">
            <Col span={8}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        background: '#f0f2f5',
                        borderRadius: '50%',
                        width: '50px',
                        height: '50px',
                        margin: '0 auto',
                    }}
                >
                    {React.isValidElement(props.data.icon) &&
                        React.cloneElement(props.data.icon as React.ReactElement, {
                            style: { fontSize: '28px', color: '#1890ff' },
                        })}
                </div>
            </Col>
            <Col span={16}>
                <div
                    style={{
                        textAlign: 'center',
                        fontSize: '32px',
                        fontWeight: 600,
                        color: '#333',
                    }}
                >
                    {props.data.count}
                </div>
            </Col>
        </Row>
    </Card>
);

export default StatsCard;
