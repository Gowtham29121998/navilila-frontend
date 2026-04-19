import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cart: [],
  favorites: [],
};

const userProductSlice = createSlice({
  name: 'userProduct',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const existItem = state.cart.find((x) => x.id === item.id);

      if (existItem) {
        state.cart = state.cart.map((x) =>
          x.id === existItem.id ? { ...x, qty: x.qty + 1 } : x
        );
      } else {
        state.cart.push({ ...item, qty: 1 });
      }
    },
    updateCartQty: (state, action) => {
      const { id, qty } = action.payload;
      state.cart = state.cart.map((x) =>
        x.id === id ? { ...x, qty: Number(qty) } : x
      );
    },
    removeFromCart: (state, action) => {
      state.cart = state.cart.filter((x) => x.id !== action.payload);
    },
    toggleFavorite: (state, action) => {
      const productId = action.payload;
      const index = state.favorites.indexOf(productId);
      if (index >= 0) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(productId);
      }
    },
    clearUserProducts: (state) => {
      state.cart = [];
      state.favorites = [];
    }
  },
});

export const { addToCart, updateCartQty, removeFromCart, toggleFavorite, clearUserProducts } = userProductSlice.actions;
export default userProductSlice.reducer;
