import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { getOrderListByUserId } from "../../api/modules/order/order";
import { Order } from "../../interface/order/order";

interface OrderListState {
  list: Order[];
  loading: boolean;
  error: string | null;
}

const initialState: OrderListState = {
  list: [],
  loading: false,
  error: null,
};

// 异步获取订单列表
export const fetchOrdersByUser = createAsyncThunk(
  "orderList/fetchOrdersByUser",
  async (userId: number) => {
    const res = await getOrderListByUserId(userId);
    console.log("获取订单列表", res);
    return res;
  }
);

const orderListSlice = createSlice({
  name: "orderList",
  initialState,
  reducers: {
    clearOrderList: (state) => {
      state.list = [];
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrdersByUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(
        fetchOrdersByUser.fulfilled,
        (state, action: PayloadAction<Order[]>) => {
          state.loading = false;
          state.list = action.payload;
        }
      )
      .addCase(fetchOrdersByUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "获取订单列表失败";
      });
  },
});

export const { clearOrderList } = orderListSlice.actions;
export default orderListSlice.reducer;
