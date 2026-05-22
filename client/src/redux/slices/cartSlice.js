import { createSlice } from '@reduxjs/toolkit';

const cartKey = (item) => `${item._id}_${item.variantSku || 'default'}`;

const cartSlice = createSlice({
  name: 'cart',
  initialState: { items: [], isOpen: false },
  reducers: {
    addToCart: (state, action) => {
      const item = action.payload;
      const key = cartKey(item);
      const existing = state.items.find((i) => cartKey(i) === key);
      if (existing) {
        existing.quantity += item.quantity || 1;
      } else {
        state.items.push({ ...item, quantity: item.quantity || 1 });
      }
      state.isOpen = true;
    },
    removeFromCart: (state, action) => {
      state.items = state.items.filter((i) => cartKey(i) !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { key, quantity } = action.payload;
      const item = state.items.find((i) => cartKey(i) === key);
      if (item) {
        if (quantity <= 0) state.items = state.items.filter((i) => cartKey(i) !== key);
        else item.quantity = quantity;
      }
    },
    clearCart: (state) => { state.items = []; },
    toggleCart: (state) => { state.isOpen = !state.isOpen; },
    setCartOpen: (state, action) => { state.isOpen = action.payload; },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart, toggleCart, setCartOpen } = cartSlice.actions;
export const selectCartItems = (state) => state.cart.items;
export const selectCartCount = (state) => state.cart.items.reduce((a, i) => a + i.quantity, 0);
export const selectCartTotal = (state) => state.cart.items.reduce((a, i) => a + (i.price || 0) * i.quantity, 0);
export const getCartKey = cartKey;
export default cartSlice.reducer;
