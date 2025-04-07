import React from 'react'
import { Typography, Button, Row, Col, Card, Space, Image } from 'antd'
import { Link } from 'react-router-dom'
import { UserOutlined, SafetyOutlined, RocketOutlined, BarChartOutlined } from '@ant-design/icons'
import './index.css'
import logoImage from '../../assets/logo_black.png'

const { Title, Paragraph } = Typography

const Welcome: React.FC = () => {
  return (
    <div className="welcome-container">
      <div className="welcome-header">
        <div className="logo-container">
          <Image src={logoImage} alt="冷链管理系统" preview={false} height={60} />
        </div>
        <div className="auth-buttons">
          <Space>
            <Link to="/login?tab=login">
              <Button type="primary" size="large">
                登录
              </Button>
            </Link>
            <Link to="/login?tab=signup">
              <Button size="large">注册</Button>
            </Link>
          </Space>
        </div>
      </div>

      <div className="welcome-content">
        <Row justify="center" align="middle" className="hero-section">
          <Col xs={24} md={12}>
            <Title level={1}>冷链模块租赁平台</Title>
            <Paragraph className="hero-description">
              全面的冷链模块租赁平台，为您提供高效、安全、可靠的冷链管理服务。
            </Paragraph>
            <Link to="/login?tab=login">
              <Button type="primary" size="large">
                立即开始
              </Button>
            </Link>
          </Col>
          <Col xs={24} md={12} className="hero-image">
            {/* 这里可以放置一个冷链物流相关的图片，之后有空加一下吧，没空就算了，好烦 */}
          </Col>
        </Row>

        <div className="features-section">
          <Title level={2} className="section-title">系统特点</Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="feature-card">
                <UserOutlined className="feature-icon" />
                <Title level={4}>用户管理</Title>
                <Paragraph>
                  多角色用户系统，支持管理员、冷链业务管理员、个人用户和商业用户。
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="feature-card">
                <SafetyOutlined className="feature-icon" />
                <Title level={4}>安全监控</Title>
                <Paragraph>
                  实时温度监控和报警系统，确保冷链产品安全。
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="feature-card">
                <RocketOutlined className="feature-icon" />
                <Title level={4}>高效调度</Title>
                <Paragraph>
                  智能车辆调度和路线规划，提高物流效率。
                </Paragraph>
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="feature-card">
                <BarChartOutlined className="feature-icon" />
                <Title level={4}>数据分析</Title>
                <Paragraph>
                  全面的数据统计和分析功能，助力业务决策。
                </Paragraph>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      <div className="welcome-footer">
        <Paragraph>© {new Date().getFullYear()} 冷链模块租赁平台 版权所有</Paragraph>
      </div>
    </div>
  )
}

export default Welcome