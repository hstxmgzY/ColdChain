import React from "react";
import { Button, Layout, Avatar, Dropdown, Typography } from "antd";
import type { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { CommonHeaderProps } from "../../../interface/common/commonHeader";
import avatarUrl from '../../../assets/images/2.jpg';
import './index.css';
import { useUser } from "../../../contexts/UserContext";

const { Header } = Layout;

const CommonHeader: React.FC<CommonHeaderProps> = ({ collapsed, onCollapseChange }) => {
    const { userInfo, logout } = useUser();
    const navigate = useNavigate();

    // 用户菜单项
    const userMenuItems: MenuProps['items'] = [
        {
            key: '1',
            icon: <UserOutlined />,
            label: '个人信息',
            onClick: () => navigate('/user/profile'),
        },
        {
            key: '2',
            icon: <SettingOutlined />,
            label: '设置',
        },
        {
            type: 'divider',
        },
        {
            key: '3',
            icon: <LogoutOutlined />,
            label: '退出登录',
            onClick: logout,
        },
    ];

    // 获取用户名首字母作为头像显示
    const getAvatarContent = () => {
        if (userInfo && userInfo.username) {
            return userInfo.username.charAt(0).toUpperCase();
        }
        return null;
    };

    return (
        <Header className="header-container">
            <Button
                type="text"
                icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={() => onCollapseChange(!collapsed)}
                style={{
                    fontSize: '16px',
                    width: 64,
                    height: 64,
                }}
            />
            <div className="user-info">
                {userInfo && userInfo.username ? (
                    <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                        <div style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                            <Typography.Text style={{ marginRight: 8 }}>
                                {userInfo.username}
                            </Typography.Text>
                            <Avatar
                                style={{ backgroundColor: '#1890ff' }}
                                size={36}
                            >
                                {getAvatarContent()}
                            </Avatar>
                        </div>
                    </Dropdown>
                ) : (
                    <Avatar src={avatarUrl} size={36} />
                )}
            </div>
        </Header>
    )
}

export default CommonHeader;