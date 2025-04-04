import React, { useContext } from "react"
import LoginForm from "../../components/login/index"
import UserContext from "../../contexts/UserContext"

export default function LoginPage() {
    const userContext = useContext(UserContext)
    if (!userContext) {
        throw new Error("UserContext is undefined. Make sure you are using LoginPage within a UserContextProvider.")
    }
    const { login } = userContext

    return (
        <div className="login-container">
            <LoginForm onLogin={(userData) => login(userData.phone, userData.password)} />
        </div>
    )
}
