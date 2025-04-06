import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import { RootState } from '../../../../store'
import { Card, NavBar, Image, List, Button, Input, Toast } from 'antd-mobile'
import { LeftOutline } from 'antd-mobile-icons'
import { removeItem, updateItem } from '../../../../store/reducers/order'

const OrderItemDetail = () => {
    const { index } = useParams<{ index: string }>()
    const itemIndex = parseInt(index || '0')
    const item = useSelector((state: RootState) => state.orders.order.order_items[itemIndex])
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [isEditing, setIsEditing] = useState(false)
    const [editableItem, setEditableItem] = useState(item)

    if (!item) {
        return <div>未找到商品信息</div>
    }

    const handleDelete = () => {
        dispatch(removeItem(itemIndex))
        Toast.show({ icon: 'success', content: '商品已删除' })
        navigate('/order/create')
    }

    const handleSave = () => {
        dispatch(updateItem({ index: itemIndex, item: editableItem }))
        Toast.show({ icon: 'success', content: '修改成功' })
        setIsEditing(false)
        navigate('/order/create')
    }

    const handleCancel = () => {
        setEditableItem(item)
        setIsEditing(false)
    }

    return (
        <div>
            <NavBar backArrow={<LeftOutline />} onBack={() => navigate(-1)}>
                商品详情
            </NavBar>

            <Card title={editableItem.product.product_name} style={{ margin: 12 }}>
                {editableItem.product.image_url && (
                    <Image
                        src={editableItem.product.image_url}
                        width={120}
                        height={120}
                        fit="cover"
                        style={{ marginBottom: 12 }}
                    />
                )}

                <List>
                    <List.Item title="商品名称">
                        {isEditing ? (
                            <Input
                                value={editableItem.product.product_name}
                                onChange={(val) =>
                                    setEditableItem({
                                        ...editableItem,
                                        product: { ...editableItem.product, product_name: val },
                                    })
                                }
                            />
                        ) : (
                            editableItem.product.product_name
                        )}
                    </List.Item>
                    <List.Item title="分类">
                        {isEditing ? (
                            <Input
                                value={editableItem.product.category_name}
                                onChange={(val) =>
                                    setEditableItem({
                                        ...editableItem,
                                        product: { ...editableItem.product, category_name: val },
                                    })
                                }
                            />
                        ) : (
                            editableItem.product.category_name
                        )}
                    </List.Item>
                    <List.Item title="数量">
                        {isEditing ? (
                            <Input
                                type="number"
                                value={editableItem.quantity.toString()}
                                onChange={(val) =>
                                    setEditableItem({ ...editableItem, quantity: parseInt(val) || 0 })
                                }
                            />
                        ) : (
                            editableItem.quantity
                        )}
                    </List.Item>
                    <List.Item title="温度范围">
                        {isEditing ? (
                            <div style={{ display: 'flex', gap: 6 }}>
                                <Input
                                    type="number"
                                    value={editableItem.product.min_temperature?.toString() || ''}
                                    onChange={(val) =>
                                        setEditableItem({
                                            ...editableItem,
                                            product: { ...editableItem.product, min_temperature: parseInt(val) || 0 },
                                        })
                                    }
                                    placeholder="最低温度"
                                />
                                ~
                                <Input
                                    type="number"
                                    value={editableItem.product.max_temperature?.toString() || ''}
                                    onChange={(val) =>
                                        setEditableItem({
                                            ...editableItem,
                                            product: { ...editableItem.product, max_temperature: parseInt(val) || 0 },
                                        })
                                    }
                                    placeholder="最高温度"
                                />
                            </div>
                        ) : (
                            `${editableItem.product.min_temperature}℃ ~ ${editableItem.product.max_temperature}℃`
                        )}
                    </List.Item>
                    <List.Item title="规格重量">
                        {isEditing ? (
                            <Input
                                type="number"
                                value={editableItem.product.spec_weight?.toString() || ''}
                                onChange={(val) =>
                                    setEditableItem({
                                        ...editableItem,
                                        product: { ...editableItem.product, spec_weight: parseFloat(val) || 0 },
                                    })
                                }
                            />
                        ) : (
                            `${editableItem.product.spec_weight} kg`
                        )}
                    </List.Item>
                    <List.Item title="规格体积">
                        {isEditing ? (
                            <Input
                                type="number"
                                value={editableItem.product.spec_volume?.toString() || ''}
                                onChange={(val) =>
                                    setEditableItem({
                                        ...editableItem,
                                        product: { ...editableItem.product, spec_volume: parseFloat(val) || 0 },
                                    })
                                }
                            />
                        ) : (
                            `${editableItem.product.spec_volume} m³`
                        )}
                    </List.Item>
                </List>
            </Card>

            <div style={{ padding: 12, display: 'flex', gap: 12 }}>
                {isEditing ? (
                    <>
                        <Button block color="primary" onClick={handleSave}>
                            保存
                        </Button>
                        <Button block onClick={handleCancel}>
                            取消
                        </Button>
                    </>
                ) : (
                    <Button block color="primary" onClick={() => setIsEditing(true)}>
                        修改
                    </Button>
                )}
                <Button block color="danger" onClick={handleDelete}>
                    删除
                </Button>
            </div>
        </div>
    )
}

export default OrderItemDetail