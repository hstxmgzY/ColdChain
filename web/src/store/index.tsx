import { configureStore } from "@reduxjs/toolkit";
import tabReducer from "./reducers/tab";

const store = configureStore({
    reducer: { tab: tabReducer },
});

export default store;
