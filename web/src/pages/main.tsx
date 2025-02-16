import React, { useState } from 'react';
import { Layout, theme } from 'antd';
import CommonAside from '../components/common/commonAside';
import CommonHeader from '../components/common/commonHeader';
import { Outlet } from 'react-router-dom';

const { Content } = Layout;

const Main: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    return (
        <Layout className='main-container'>
            <CommonAside collapsed={collapsed} />
            <Layout>
                <CommonHeader 
                    collapsed={collapsed}
                    onCollapseChange={(newCollapsed) => setCollapsed(newCollapsed)}
                />
                <Content
                    style={{
                        margin: '24px 16px',
                        padding: 20,
                        minHeight: 400,
                        background: colorBgContainer,
                        borderRadius: borderRadiusLG,
                    }}
                >
                    <Outlet />
                </Content>
            </Layout>
        </Layout>

    );
};

export default Main;