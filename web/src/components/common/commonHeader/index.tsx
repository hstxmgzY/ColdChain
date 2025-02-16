import React from "react";
import { Button, Layout, Avatar } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { CommonHeaderProps } from "../../../interface/common/commonHeader";
import avatarUrl from '../../../assets/images/2.jpg';
import './index.css';

const { Header } = Layout;

const CommonHeader: React.FC<CommonHeaderProps> = ({ collapsed, onCollapseChange }) => {
    
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
            <div>
                <Avatar src={avatarUrl} size={36}/>
            </div>
        </Header>
    )
}

export default CommonHeader;