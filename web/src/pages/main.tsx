import React, { useState } from 'react';
import { Layout, theme, Breadcrumb, Typography } from 'antd';
import CommonAside from '../components/common/commonAside';
import CommonHeader from '../components/common/commonHeader';
import { Outlet, Link, useLocation } from 'react-router-dom';
import routesConfig from '../config'

const { Content, Sider } = Layout;
const { Text } = Typography

interface RouteItem {
    path: string;
    name: string;
    label: string;
    icon?: string;
    url?: string;
    children?: RouteItem[];
}

const findRouteChain = (
    routes: RouteItem[],
    pathname: string
): RouteItem[] | null => {
    for (const route of routes) {
        if (route.path === pathname) {
            return [route];
        }
        // 如果有子路由，递归查找
        if (route.children) {
            const childChain = findRouteChain(route.children, pathname);
            if (childChain) {
                return [route, ...childChain];
            }
        }
    }
    return null;
};


const Main: React.FC = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    // 获取当前路径
    const location = useLocation();

    // 根据路径片段生成 breadcrumb 数据（包含 url 和名称）
    const chain = findRouteChain(routesConfig as RouteItem[], location.pathname) || [];

    // 检查生成的 breadcrumb 数据中是否已有“首页”
    const hasHome = chain.some(item => item.label === '首页');
    const breadcrumbChainItems = chain.map((item, index, arr) => {
        const isLast = index === arr.length - 1;
        return {
            title: isLast ? (
                <Text>{item.label}</Text>
            ) : (
                <Text type='secondary'>{item.label}</Text>
            ),
        };
    });
    // 如果没有“首页”，则添加首页项
    const breadcrumbItems = [
        ...(!hasHome
            ? [
                {
                    title: <Link to="/home">{'首页'}</Link>,
                },
            ]
            : []),
        ...breadcrumbChainItems
    ];
    return (
        <Layout className='main-container'>
            <Sider collapsed={collapsed} >
                <CommonAside collapsed={collapsed} />
            </Sider>
            <Layout>
                <CommonHeader
                    collapsed={collapsed}
                    onCollapseChange={(newCollapsed) => setCollapsed(newCollapsed)}
                />
                <Breadcrumb
                    items={breadcrumbItems}
                    style={{ margin: '16px 18px 0 18px' }}
                />
                <Content
                    style={{
                        margin: '16px 16px',
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