import { configureStore } from "@reduxjs/toolkit"
import tabReducer from "./reducers/tab"
import orderReducer from "./reducers/order"

const store = configureStore({
    reducer: {
        tab: tabReducer,
        orders: orderReducer,
    },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store
