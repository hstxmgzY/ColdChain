import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit"
import {
    getOrderList,
    createOrder,
    updateOrder,
    deleteOrder,
} from "../../api/modules/order/order"
import { RootState } from "../index"
import { OrderType } from "../../interface/order/order"

interface OrderState {
    orders: OrderType[]
    loading: boolean
    error: string | null
}

const initialState: OrderState = {
    orders: [],
    loading: false,
    error: null,
}

export const fetchOrders = createAsyncThunk("orders/fetchOrders", async () => {
    const response = await getOrderList()
    // console.log("response", response);
    return response
})

// 创建订单
export const createNewOrder = createAsyncThunk(
    "orders/createOrder",
    async (orderData: Partial<OrderType>) => {
        const response = await createOrder(orderData)
        return response
    }
)

// 更新订单
export const updateExistingOrder = createAsyncThunk(
    "orders/updateOrder",
    async ({
        id,
        updatedData,
    }: {
        id: number
        updatedData: Partial<OrderType>
    }) => {
        const response = await updateOrder(id, updatedData)
        return response
    }
)

// 删除订单
export const removeOrder = createAsyncThunk(
    "orders/deleteOrder",
    async (id: number) => {
        await deleteOrder(id)
        return id
    }
)

const orderSlice = createSlice({
    name: "orders",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.loading = true
                state.error = null
            })
            .addCase(
                fetchOrders.fulfilled,
                (state, action: PayloadAction<OrderType[]>) => {
                    state.loading = false
                    state.orders = action.payload
                }
            )
            .addCase(fetchOrders.rejected, (state, action) => {
                state.loading = false
                state.error = action.error.message || "获取订单失败"
            })
            // 创建订单
            .addCase(
                createNewOrder.fulfilled,
                (state, action: PayloadAction<OrderType>) => {
                    state.orders.push(action.payload)
                }
            )
            // 更新订单
            .addCase(
                updateExistingOrder.fulfilled,
                (state, action: PayloadAction<OrderType>) => {
                    const index = state.orders.findIndex(
                        (order) => order.id === action.payload.id
                    )
                    if (index !== -1) {
                        state.orders[index] = action.payload
                    }
                }
            )
            // 删除订单
            .addCase(
                removeOrder.fulfilled,
                (state, action: PayloadAction<number>) => {
                    state.orders = state.orders.filter(
                        (order) => order.id !== action.payload
                    )
                }
            )
    },
})

export default orderSlice.reducer

export const selectOrders = (state: RootState) => state.orders.orders
export const selectOrderLoading = (state: RootState) => state.orders.loading
export const selectOrderError = (state: RootState) => state.orders.error
