import { configureStore } from "@reduxjs/toolkit";
import orderReducer from "./reducers/order"; // 创建订单
import orderListReducer from "./reducers/orderList"; // 获取订单列表
import userReducer from "./reducers/user";

const store = configureStore({
  reducer: {
    order: orderReducer, // 创建订单相关
    orderList: orderListReducer, // 订单列表/详情模块
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
