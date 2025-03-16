import { createRoot } from "react-dom/client"
import App from "./App.tsx"
import "./index.css"
import React from "react"
import { Provider } from "react-redux"
import store from "./store/index.tsx"
import "./mock/userMock.ts"
import "./mock/leaseMock.ts"
import "./mock/reviewMock.ts"
import { ConfigProvider } from "antd"
import zhCN from "antd/locale/zh_CN"

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <Provider store={store}>
            <ConfigProvider locale={zhCN}>
                <App />
            </ConfigProvider>
        </Provider>
    </React.StrictMode>
)
