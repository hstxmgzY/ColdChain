import AppRouter from "./router"
import { useEffect } from "react"
import { useDispatch } from "react-redux"
import { updateUserInfo } from "./store/reducers/user"
import { RouterProvider } from "react-router-dom"
import { UserProvider } from "./contexts/UserContext"

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    // 应用启动时同步 localStorage 到 Redux
    const userInfoStr = localStorage.getItem("userInfo")
    if (userInfoStr) {
      dispatch(updateUserInfo(JSON.parse(userInfoStr)))
    }
  }, [dispatch])
  return (
    <UserProvider>
      <AppRouter />
    </UserProvider>
  );
}
export default App
