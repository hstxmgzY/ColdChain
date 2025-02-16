import React from "react";
import { Outlet } from "react-router-dom";

const Resources = () => {
    return (
        <div>
            <h1>Resources Page</h1>
             <Outlet />
        </div>
    )
}

export default Resources;