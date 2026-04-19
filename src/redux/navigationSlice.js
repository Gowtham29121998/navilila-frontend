import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  currentPath: '/',
  isOpen: false, // Useful for mobile navigation menu
  isAuthModalOpen: false,
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setCurrentPath: (state, action) => {
      state.currentPath = action.payload;
    },
    toggleNavigation: (state) => {
      state.isOpen = !state.isOpen;
    },
    setNavigationOpen: (state, action) => {
      state.isOpen = action.payload;
    },
    toggleAuthModal: (state, action) => {
      state.isAuthModalOpen = action.payload !== undefined ? action.payload : !state.isAuthModalOpen;
    }
  },
});

// Export actions
export const { setCurrentPath, toggleNavigation, setNavigationOpen, toggleAuthModal } = navigationSlice.actions;

// Export reducer
export default navigationSlice.reducer;
