import React, { createContext, useContext, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserInfo as updateUserAction } from '../store/reducers/user';
import { RootState } from '../store';
import { UserType } from '../interface/user/user';

interface UserContextType {
  userInfo: UserType;
  updateUserInfo: (info: UserType) => void;
  login: (phone: string, password: string) => void;
  logout: () => void;
  register: (userInfo: UserType) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const userInfo = useSelector((state: RootState) => state.user.userInfo) || {} as UserType;
  const dispatch = useDispatch();

  const updateUserInfo = (info: UserType) => {
    dispatch(updateUserAction(info));
  };

  // 实现登录方法
  const login = async (phone: string, password: string) => {
    try {
      // 这里可以调用API进行登录，然后更新用户信息
      // 示例：使用之前定义的login API
      const response = await import('../api/modules/user').then(module => {
        return module.login({ phone, password });
      });
      
      if (response && response.data) {
        updateUserInfo(response.data);
      }
    } catch (error) {
      console.error('登录失败:', error);
    }
  };

  // 实现登出方法
  const logout = () => {
    // 清除用户信息
    dispatch({ type: 'user/clearUserInfo' });
  };

  // 实现注册方法
  const register = (userInfo: UserType) => {
    // 这里可以调用API进行注册
    console.log('注册用户:', userInfo);
  };

  return (
    <UserContext.Provider value={{ userInfo, updateUserInfo, login, logout, register }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export default UserContext;