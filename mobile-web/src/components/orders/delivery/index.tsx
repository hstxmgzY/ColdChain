import React from 'react'
import { NavBar, List, Card } from 'antd-mobile'
import { LeftOutline } from 'antd-mobile-icons'
import { useNavigate, useParams } from 'react-router-dom'

const mockBoxes = [
    { id: 1, temperature: '4°C', battery: '80%', location: '广州仓库', lat: 23.1291, lng: 113.2644 },
    { id: 2, temperature: '5°C', battery: '75%', location: '深圳中转站', lat: 22.5431, lng: 114.0579 },
    { id: 3, temperature: '3°C', battery: '90%', location: '北京配送中心', lat: 39.9042, lng: 116.4074 },
]

const OrderDeliveryDetail = () => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()

    return (
        <div style={{ padding: 12 }}>
            <NavBar backArrow={<LeftOutline />} onBack={() => navigate(-1)}>
                订单 #{id} 冷链箱配送信息
            </NavBar>
            {mockBoxes.map((box) => (
                <Card key={box.id} title={`冷链箱 #${box.id}`} style={{ marginBottom: 12 }}>
                    <div>
                        <List>
                            <List.Item title="温度">{box.temperature}</List.Item>
                            <List.Item title="电量">{box.battery}</List.Item>
                            <List.Item title="位置">{box.location}</List.Item>
                        </List>
                        <div style={{ marginTop: 8 }}>
                            {/* 这里使用 Google Map 的嵌入地址，若在国内环境下建议使用高德或百度地图 */}
                            <iframe
                                src={`https://maps.google.com/maps?q=${box.lat},${box.lng}&z=15&output=embed`}
                                width="100%"
                                height="200"
                                frameBorder="0"
                                style={{ border: 0 }}
                                allowFullScreen
                                aria-hidden="false"
                                tabIndex={0}
                            ></iframe>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    )
}

export default OrderDeliveryDetail
