import React, { useEffect } from "react"
import { Typography, Divider, Dropdown, Avatar, message } from "antd"
import { Link, useNavigate } from "react-router-dom"
import {
  UserOutlined,
  LogoutOutlined,
  ProfileOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons"
import { useSelector, useDispatch } from "react-redux"
import { updateUserInfo, clearUserInfo } from "../../store/reducers/user"
import { RootState } from "../../store"
import "./index.css"

const { Text } = Typography

const UserSection = () => {
  const navigate = useNavigate()
  const userInfo = useSelector((state: RootState) => state.user.userInfo)
  const dispatch = useDispatch()

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetchUserInfo()
    }
  }, [])

  const fetchUserInfo = async () => {
    try {
      // 优先从 Redux 获取已存在的用户信息
      if (userInfo?.user_id) return

      // 尝试从 localStorage 恢复
      const userInfoStr = localStorage.getItem("userInfo")
      if (userInfoStr) {
        const localUserInfo = JSON.parse(userInfoStr)
        dispatch(updateUserInfo(localUserInfo))
        return
      }

      // 最后从 API 获取最新数据
      // const response = await getUserById() // 假设可以直接获取当前用户
      // if (response) {
      //   dispatch(updateUserInfo(response))
      //   localStorage.setItem("userInfo", JSON.stringify(response))
      // }
    } catch (error) {
      // 清理无效数据
      localStorage.removeItem("token")
      localStorage.removeItem("userInfo")
      dispatch(clearUserInfo())
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("userInfo")
    dispatch(clearUserInfo())
    message.success("Logout successful")
    navigate("/")
  }

  const dropdownItems = [
    {
      key: "profile",
      label: "Profile",
      icon: <ProfileOutlined />,
      onClick: () => navigate("/profile"),
    },
    {
      key: "logout",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  if (userInfo?.role === "admin") {
    dropdownItems.unshift({
      key: "manage",
      label: "Manage",
      icon: <AppstoreAddOutlined />, // 管理选项的图标
      onClick: () => navigate("/admin"), // 假设管理员管理页面路径为 /admin
    })
  }

  console.log(userInfo)
  if (userInfo) {
    return (
      <Dropdown menu={{ items: dropdownItems }} placement="bottomRight" arrow>
        <div className="user-info">
          <Avatar
            icon={<UserOutlined />}
            style={{
              backgroundColor:
                userInfo.role === "admin" ? "#f56a00" : "#87d068",
            }}
          />
          <Text strong className="username">
            {userInfo?.username}
            {userInfo?.role === "admin" && (
              <span className="admin-badge">Admin</span>
            )}
          </Text>
        </div>
      </Dropdown>
    )
  }

  return (
    <div className="login-register">
      <Text strong>
        <Link to="/login?tab=login">Login</Link>
      </Text>
      <Divider type="vertical" />
      <Text strong>
        <Link to="/login?tab=signup">Register</Link>
      </Text>
    </div>
  )
}

export default UserSection
