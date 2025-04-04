import { configureStore } from "@reduxjs/toolkit"
import tabReducer from "./reducers/tab"
import orderReducer from "./reducers/order"
import userReducer from "./reducers/user"

const store = configureStore({
    reducer: {
        tab: tabReducer,
        orders: orderReducer,
        user: userReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
