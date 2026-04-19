import { configureStore } from '@reduxjs/toolkit';
import navigationReducer from './navigationSlice';
import userReducer from './userSlice';
import userProductReducer from './userProductSlice';

export const store = configureStore({
  reducer: {
    navigation: navigationReducer,
    user: userReducer,
    userProduct: userProductReducer,
  },
});
