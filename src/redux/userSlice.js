import { createSlice } from '@reduxjs/toolkit';

// Try to get initially from localStorage
const storedUserInfo = localStorage.getItem('userInfo');
const initialState = {
  userInfo: storedUserInfo ? JSON.parse(storedUserInfo) : null,
  isAuthenticated: !!storedUserInfo,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.userInfo = action.payload;
      state.isAuthenticated = true;
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
    logout: (state) => {
      state.userInfo = null;
      state.isAuthenticated = false;
      localStorage.removeItem('userInfo');
    },
  },
});

export const { setUser, logout, setCart, setFavorites } = userSlice.actions;
export default userSlice.reducer;
