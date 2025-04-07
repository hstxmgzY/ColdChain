import React, { createContext, useContext, ReactNode } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { updateUserInfo as updateUserAction } from '../store/reducers/user'
import { RootState } from '../store'
import { UserType } from '../interface/user/user'
import { Toast } from 'antd-mobile'

interface UserContextType {
  userInfo: UserType
  updateUserInfo: (info: UserType) => void
  login: (phone: string, password: string) => void
  logout: () => void
  register: (userInfo: UserType) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

interface UserProviderProps {
  children: ReactNode
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const userInfo = useSelector((state: RootState) => state.user.userInfo)
  const dispatch = useDispatch()

  const updateUserInfo = (info: UserType) => {
    dispatch(updateUserAction(info))
  }

  const login = async (phone: string, password: string) => {
    try {
      const response = await import('../api/modules/user').then((module) =>
        module.login({ phone, password })
      )

      if (response && response.data) {
        updateUserInfo(response.data)
        Toast.show({ icon: 'success', content: '登录成功' })
      } else {
        Toast.show({ icon: 'fail', content: '登录失败，请检查手机号或密码' })
      }
    } catch (error) {
      console.error('登录失败:', error)
      Toast.show({ icon: 'fail', content: '登录异常，请稍后重试' })
    }
  }

  const logout = () => {
    dispatch({ type: 'user/clearUserInfo' })
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    Toast.show({ icon: 'success', content: '登出成功' })
    window.location.href = '/'
  }

  const register = (userInfo: UserType) => {
    console.log('注册用户:', userInfo)

    const registerAsync = async () => {
      try {
        const response = await import('../api/modules/user').then((module) =>
          module.addUser(userInfo)
        )

        if (response.code === 200) {
          Toast.show({ icon: 'success', content: '注册成功，请登录' })
          window.location.href = '/login'
        } else {
          Toast.show({ icon: 'fail', content: response.message || '注册失败' })
        }
      } catch (error) {
        console.error('注册失败:', error)
        Toast.show({ icon: 'fail', content: '注册失败，请重试' })
      }
    }

    registerAsync()
  }

  return (
    <UserContext.Provider value={{ userInfo, updateUserInfo, login, logout, register }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export default UserContext
