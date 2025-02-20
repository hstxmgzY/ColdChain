import React from 'react'
import * as Icon from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom'
import { Menu, Layout } from 'antd';
import logo from '../../../assets/logo-white.png';
import { CommonAsideProps } from '../../../interface/common/commonAside';
import MenuConfig from '../../../config';

const { Sider } = Layout;

const iconToElement = (icon: keyof typeof Icon) => {
  const IconComponent = Icon[icon] as React.ComponentType;
  return <IconComponent />;
}

// 处理菜单的数据
const items = MenuConfig.map((item) => {
  // 没有子菜单
  const child = {
    key: item.path,
    icon: iconToElement(item.icon as keyof typeof Icon),
    label: item.label,
  }
  // 有子菜单
  if (item.children) {
    const children = item.children.map((childItem) => ({
      key: childItem.path,
      icon: iconToElement(childItem.icon as keyof typeof Icon),
      label: childItem.label,
    }))
    return {
      ...child,
      children,
    }
  }
  return child;
})

const CommonAside: React.FC<CommonAsideProps> = ({ collapsed }) => {
  const navigate = useNavigate()
  const location = useLocation()

  // 点击菜单项时，使用 navigate 跳转到对应的路由
  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key)
  }
  
  return (
    <Sider trigger={null} collapsible collapsed={collapsed}>
      <div className='logo'>
        {collapsed ? <div className='app-logo'><img src={logo} alt="Logo-white" /></div> : <h3 className='app-name'>冷链模块管理系统</h3>}
      </div>
      <Menu
        onClick={handleMenuClick}
        theme="dark"
        mode="inline"
        defaultSelectedKeys={[location.pathname]}
        items={items}
        style={{ height: '100%' }}
      />
    </Sider>
  )
}

export default CommonAside
