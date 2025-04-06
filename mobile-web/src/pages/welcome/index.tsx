import React from 'react'
import { Button } from 'antd-mobile'
import { useNavigate } from 'react-router-dom'
import {
  UserOutline,
  EyeOutline,
  TruckOutline,
  TextOutline
} from 'antd-mobile-icons'
import './index.css'

const Welcome: React.FC = () => {
  const navigate = useNavigate()

  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <h2 className="logo-text">冷链物流管理系统</h2>
        <div className="button-group">
          <Button
            color="primary"
            fill="outline"
            size="small"
            onClick={() => navigate('/login?tab=login')}
          >
            登录
          </Button>
          <Button
            color="primary"
            size="small"
            onClick={() => navigate('/login?tab=signup')}
          >
            注册
          </Button>
        </div>
      </div>

      <div className="welcome-hero">
        <h1>欢迎使用冷链模块租赁平台</h1>
        <p className="hero-description">
          一站式冷链解决方案,
        </p>
        <p className="hero-description">
          保障您的运输安全与效率。
        </p>
        <Button
          color="primary"
          size="large"
          shape="rounded"
          onClick={() => navigate('/login?tab=login')}
        >
          立即开始
        </Button>
      </div>

      <div className="features-section">
        <h2 className="section-title">系统核心功能</h2>
        <div className="feature-cards">
          {[
            {
              title: '用户管理',
              desc: '多角色支持，管理员/用户权限分明。',
              icon: <UserOutline className="feature-icon" />,
            },
            {
              title: '安全监控',
              desc: '全程温度记录与报警，确保冷链稳定。',
              icon: <EyeOutline className="feature-icon" />,
            },
            {
              title: '高效调度',
              desc: '智能路径规划，降低运输成本。',
              icon: <TruckOutline className="feature-icon" />,
            },
            {
              title: '数据分析',
              desc: '全面运营数据，辅助商业决策。',
              icon: <TextOutline className="feature-icon" />,
            },
          ].map((item, index) => (
            <div key={index} className="feature-card">
              {item.icon}
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <footer className="welcome-footer">
        © {new Date().getFullYear()} 冷链物流管理系统 · 保留所有权利
      </footer>
    </div>
  )
}

export default Welcome
