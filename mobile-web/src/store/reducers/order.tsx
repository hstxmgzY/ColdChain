import { createSlice, PayloadAction, createAsyncThunk } from "@reduxjs/toolkit";
import { createOrder, getOrderDetail } from "../../api/modules/order/order";
// import { RootState } from "../index"
import { Order, OrderItem, ContactInfo } from "../../interface/order/order";

import { UserInfo } from "../../interface/user/user";

interface OrderState {
  order: Order;
  loading: boolean;
  error: string | null;
}

// 初始化一个空 user
const emptyUser: UserInfo = {
  user_id: 0,
  username: "",
  phone: "",
  role: "",
  address: [],
};

const initialState: OrderState = {
  order: {
    id: 0,
    order_number: "",
    status_name: "",
    sender_info: null,
    receiver_info: null,
    delivery_date: null,
    order_note: "",
    order_items: [],
    user: emptyUser,
  },
  loading: false,
  error: null,
};

// 获取订单详情
export const fetchOrderDetail = createAsyncThunk(
  "order/fetchOrderDetail",
  async (id: number, { rejectWithValue }) => {
    try {
      const res = await getOrderDetail(id);
      console.log("获取订单详情", res);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "获取订单详情失败");
    }
  }
);

// 异步提交订单
export const submitOrder = createAsyncThunk(
  "order/submitOrder",
  async (orderData: Order, { rejectWithValue }) => {
    try {
      const res = await createOrder(orderData);
      console.log(res);
      return res;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || "提交订单失败");
    }
  }
);

const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {
    setSenderInfo(state, action: PayloadAction<ContactInfo>) {
      state.order.sender_info = action.payload;
    },
    setReceiverInfo(state, action: PayloadAction<ContactInfo>) {
      state.order.receiver_info = action.payload;
    },
    setDeliveryDate(state, action: PayloadAction<string>) {
      state.order.delivery_date = action.payload;
    },
    setOrderNote(state, action: PayloadAction<string>) {
      state.order.order_note = action.payload;
    },
    setUser(state, action: PayloadAction<UserInfo>) {
      state.order.user = action.payload;
    },
    addItem(state, action: PayloadAction<OrderItem>) {
      state.order.order_items.push(action.payload);
    },
    removeItem(state, action: PayloadAction<number>) {
      state.order.order_items.splice(action.payload, 1);
    },
    updateItem(
      state,
      action: PayloadAction<{ index: number; item: OrderItem }>
    ) {
      const { index, item } = action.payload;
      if (index >= 0 && index < state.order.order_items.length) {
        state.order.order_items[index] = item;
      }
    },
    clearItems(state) {
      state.order.order_items = [];
    },
    clearAll(state) {
      state.order = {
        id: 0,
        order_number: "",
        status_name: "",
        sender_info: null,
        receiver_info: null,
        delivery_date: null,
        order_note: "",
        order_items: [],
        user: emptyUser,
      };
    },
    setOrderMeta(
      state,
      action: PayloadAction<{
        id: number;
        order_number: string;
        status_name: string;
      }>
    ) {
      const { id, order_number, status_name } = action.payload;
      state.order.id = id;
      state.order.order_number = order_number;
      state.order.status_name = status_name;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitOrder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitOrder.fulfilled, (state, action) => {
        state.loading = false;
        state.order.id = action.payload.order_id;
        state.order.status_name = "未支付";
        state.order.order_number = "";
      })
      .addCase(submitOrder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchOrderDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.order = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setSenderInfo,
  setReceiverInfo,
  setDeliveryDate,
  setOrderNote,
  setUser,
  addItem,
  removeItem,
  updateItem,
  clearItems,
  clearAll,
  setOrderMeta,
} = orderSlice.actions;

export default orderSlice.reducer;
