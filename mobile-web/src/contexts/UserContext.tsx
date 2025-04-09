import React, { createContext, useContext, ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUserInfo as updateUserAction } from '../store/reducers/user';
import { RootState } from '../store';
import { UserType } from '../interface/user/user';
import { Toast } from 'antd-mobile';
import { login as apiLogin, addUser, getUserById } from '../api/modules/user';

interface UserContextType {
  userInfo: UserType;
  updateUserInfo: (info: UserType) => void;
  login: (phone: string, password: string, captchaCode: string, captchaId: string) => Promise<void>;
  logout: () => void;
  register: (userInfo: UserType) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider = ({ children }: UserProviderProps) => {
  const userInfo = useSelector((state: RootState) => state.user.userInfo);
  const dispatch = useDispatch();

  const updateUserInfo = (info: UserType) => {
    dispatch(updateUserAction(info));
  };

  const login = async (phone: string, password: string, captchaCode: string, captchaId: string) => {
    try {
      const response = await apiLogin({
        phone: phone.trim(),
        password,
        captcha_id: captchaId,
        captcha_answer: captchaCode,
      });
      console.log('登录返回:', response);
      if (response) {
        try {
          const userResponse = await getUserById(response.user_id);
          if (userResponse) {
            updateUserInfo(userResponse);
            localStorage.setItem('userInfo', JSON.stringify(userResponse));
          }
        } catch (error) {
          console.error('获取用户信息失败:', error);
        }
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      throw error;
    }
  };

  const logout = () => {
    dispatch({ type: 'user/clearUserInfo' });
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    Toast.show({
      content: '登出成功',
      position: 'bottom'
    });
    window.location.href = '/';
  };

  const register = async (userInfo: UserType) => {
    try {
      const response = await addUser({
        username: userInfo.username.trim(),
        password: userInfo.password,
        phone: userInfo.phone,
        role: userInfo.role,
      });
      if (response) {
        Toast.show({
          content: '注册成功，请登录',
          position: 'bottom'
        });
      }
    } catch (error: any) {
      console.error('注册失败:', error);
      throw error;
    }
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
