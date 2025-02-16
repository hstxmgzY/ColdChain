import React from 'react';
import { EditOutlined, EllipsisOutlined, SettingOutlined } from '@ant-design/icons';
import { Avatar, Card, Divider, Typography } from 'antd';
import avatarUrl from '../../assets/images/2.jpg';

const { Meta } = Card;
const { Text } = Typography;

const PersonCard: React.FC = () => (
    <Card
        style={{ width: "100%" }}
        actions={[
            <SettingOutlined key="setting" />,
            <EditOutlined key="edit" />,
            <EllipsisOutlined key="ellipsis" />,
        ]}
    >
        <Meta
            avatar={<Avatar size={76} src={avatarUrl} />}
            title="YWX"
            description="超级管理员"
        />
        <Divider style={{ margin: '15px 0' }} />
        <div>
            <div>
                <Text type="secondary">
                    上次登录时间：
                </Text>
                <Text type="secondary">
                    2025-02-11
                </Text>
            </div>

            <div>
                <div>
                    <Text type="secondary">
                        上次登录地点：
                    </Text>
                    <Text type="secondary">
                        浙江
                    </Text>
                </div>
            </div>
        </div>
    </Card>
);

export default PersonCard;