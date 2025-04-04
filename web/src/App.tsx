import router from "./router"
import { RouterProvider } from "react-router-dom"
import { UserProvider } from "./contexts/UserContext"

function App() {
  return (
    <div className="App">
      <UserProvider>
        <RouterProvider router={router} />
      </UserProvider>
    </div>
  )
}
export default App
