import { configureStore } from '@reduxjs/toolkit';
import navigationReducer from './navigationSlice.js';
import userReducer from './userSlice.js';
import userProductReducer from './userProductSlice.js';

export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    user: userReducer,
    userProduct: userProductReducer,
  },
});
