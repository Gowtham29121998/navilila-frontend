import { createSlice } from '@reduxjs/toolkit';

// Try to get initially from localStorage
const storedUserInfo = localStorage.getItem('userInfo');
const storedTheme = localStorage.getItem('theme') || 'dark';
const initialState = {
  userInfo: storedUserInfo ? JSON.parse(storedUserInfo) : null,
  isAuthenticated: !!storedUserInfo,
  theme: storedTheme,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.userInfo = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    setCart: (state, action) => {
      if (state.userInfo) {
        state.userInfo.cart = action.payload;
        localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
      }
    },
    setFavorites: (state, action) => {
      if (state.userInfo) {
        state.userInfo.favorites = action.payload;
        localStorage.setItem('userInfo', JSON.stringify(state.userInfo));
      }
    },
    updateTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    logout: (state) => {
      state.userInfo = null;
      state.isAuthenticated = false;
      localStorage.removeItem('userInfo');
    },
  },
});

export const { setUser, logout, setCart, setFavorites, updateTheme } = userSlice.actions;
export default userSlice.reducer;
