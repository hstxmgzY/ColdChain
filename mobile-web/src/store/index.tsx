import { configureStore } from "@reduxjs/toolkit"
import orderReducer from "./reducers/order"
import userReducer from "./reducers/user"

const store = configureStore({
    reducer: {
        orders: orderReducer,
        user: userReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
