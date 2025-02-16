import React from "react";
import { Outlet } from "react-router-dom";

const Order = () => {
    return (
        <div>
            <h1>Order Page</h1>
            <Outlet />
        </div>
    )
}

export default Order;