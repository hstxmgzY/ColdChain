import React from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { TabBar } from 'antd-mobile'
import {
    UserOutline,
    UnorderedListOutline,
    MessageOutline,
    AddCircleOutline,
} from 'antd-mobile-icons'

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const location = useLocation()
    const navigate = useNavigate()

    const tabs = [
        {
            key: '/profile',
            title: '我的',
            icon: <UserOutline />,
        },
        {
            key: '/order/create',
            title: '创建订单',
            icon: <AddCircleOutline />,
        },
        {
            key: '/order/review',
            title: '订单列表',
            icon: <UnorderedListOutline />,
        },
        {
            key: '/notifications',
            title: '通知',
            icon: <MessageOutline />,
        },
    ]

    return (
        <div style={{ paddingBottom: 56 }}>
            <div>{children}</div>
            <div
                style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 999,
                    backgroundColor: '#fff',
                    boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
                }}
            >
                <TabBar
                    activeKey={location.pathname}
                    onChange={key => navigate(key)}
                    safeArea
                >
                    {tabs.map(item => (
                        <TabBar.Item key={item.key} icon={item.icon} title={item.title} />
                    ))}
                </TabBar>
            </div>
        </div>
    )
}

export default MainLayout
