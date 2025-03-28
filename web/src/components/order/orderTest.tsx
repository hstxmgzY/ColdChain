import React, { useEffect } from "react"
import { useDispatch, useSelector } from "react-redux"
import {
    fetchOrders,
    selectOrders,
    selectOrderLoading,
    selectOrderError,
} from "../../store/reducers/order"
import { AppDispatch } from "../../store"

const OrderTest: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>()
    const orders = useSelector(selectOrders)
    const loading = useSelector(selectOrderLoading)
    const error = useSelector(selectOrderError)

    useEffect(() => {
        dispatch(fetchOrders())
    }, [dispatch])

    if (loading) return <p>加载中...</p>
    if (error) return <p>错误: {error}</p>

    console.log(orders)

    return (
        <div>
            <h2>订单列表</h2>
            <ul>
                {orders.map((order) => (
                    <li key={order.order_number}>
                        <strong>{order.order_number}</strong> -{" "}
                        {order.status_name} - ¥{order.total_price}
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default OrderTest
