import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { wishlistAPI } from '../../services/api';

export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { rejectWithValue }) => {
  try {
    const { data } = await wishlistAPI.get();
    return data;
  } catch (err) {
    return rejectWithValue(err.friendlyMessage);
  }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId, { getState, rejectWithValue }) => {
  try {
    const exists = getState().wishlist.items.some((p) => p._id === productId);
    const { data } = exists ? await wishlistAPI.remove(productId) : await wishlistAPI.add(productId);
    return data;
  } catch (err) {
    return rejectWithValue(err.friendlyMessage);
  }
});

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: [], loading: false },
  reducers: {
    setWishlistLocal: (state, action) => { state.items = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.fulfilled, (s, a) => { s.items = a.payload; })
      .addCase(toggleWishlist.fulfilled, (s, a) => { s.items = a.payload; });
  },
});

export const { setWishlistLocal } = wishlistSlice.actions;
export default wishlistSlice.reducer;
