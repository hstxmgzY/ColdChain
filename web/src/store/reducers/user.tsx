import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { http } from '../../api/request';
import { UserType } from '../../interface/user/user';

// 用户信息类型
interface UserState {
  userInfo: UserType | null;
  loading: boolean;
  error: string | null;
}

// 初始状态
const initialState: UserState = {
  userInfo: null,
  loading: false,
  error: null,
};

// 异步获取用户信息
export const fetchUserInfo = createAsyncThunk(
  'user/fetchUserInfo',
  async () => {
    const response = await http.get('/userInfo');
    return response.data;
  }
);

// 创建用户状态切片
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 更新用户信息
    updateUserInfo: (state, action: PayloadAction<UserType>) => {
      state.userInfo = action.payload;
    },
    // 清除用户信息（登出时使用）
    clearUserInfo: (state) => {
      state.userInfo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserInfo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserInfo.fulfilled, (state, action) => {
        state.loading = false;
        state.userInfo = action.payload;
      })
      .addCase(fetchUserInfo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || '获取用户信息失败';
      });
  },
});

export const { updateUserInfo, clearUserInfo } = userSlice.actions;
export default userSlice.reducer;