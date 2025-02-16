import React from "react";
import { Outlet } from "react-router-dom";

const Screen = () => {
    return (
        <div>
            <h1>Screen Page</h1>
             <Outlet />
        </div>
    )
}

export default Screen;  