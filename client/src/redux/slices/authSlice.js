import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, syncAuthToStorage } from '../../services/api';

const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('agrilink_user') || 'null');
  } catch {
    return null;
  }
};

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.login(credentials);
    syncAuthToStorage(data);
    return data;
  } catch (err) {
    return rejectWithValue(err.friendlyMessage || err.response?.data?.message || 'Login failed');
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.register(userData);
    syncAuthToStorage(data);
    return data;
  } catch (err) {
    return rejectWithValue(err.friendlyMessage || err.response?.data?.message || 'Registration failed');
  }
});

export const fetchProfile = createAsyncThunk('auth/profile', async (_, { rejectWithValue }) => {
  try {
    const { data } = await authAPI.getProfile();
    const stored = getStoredUser() || {};
    const updated = { ...stored, ...data, token: stored.token };
    syncAuthToStorage(updated);
    return updated;
  } catch (err) {
    return rejectWithValue(err.friendlyMessage);
  }
});

const stored = getStoredUser();
const storedAddress = (() => {
  try { return JSON.parse(localStorage.getItem('agrilink_address') || 'null'); } catch { return null; }
})();

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: stored,
    deliveryAddress: storedAddress,
    loading: false,
    error: null,
    isAuthenticated: !!stored?.token,
    apiConnected: null,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.deliveryAddress = null;
      localStorage.removeItem('agrilink_user');
      localStorage.removeItem('agrilink_address');
    },
    setDeliveryAddress: (state, action) => {
      state.deliveryAddress = action.payload;
      localStorage.setItem('agrilink_address', JSON.stringify(action.payload));
    },
    setApiConnected: (state, action) => {
      state.apiConnected = action.payload;
    },
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => {
        s.loading = false; s.user = a.payload; s.isAuthenticated = true;
        if (a.payload.addresses?.length) {
          const def = a.payload.addresses.find((x) => x.isDefault) || a.payload.addresses[0];
          s.deliveryAddress = def;
          localStorage.setItem('agrilink_address', JSON.stringify(def));
        }
      })
      .addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(registerUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(registerUser.fulfilled, (s, a) => { s.loading = false; s.user = a.payload; s.isAuthenticated = true; })
      .addCase(registerUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchProfile.fulfilled, (s, a) => { s.user = { ...s.user, ...a.payload }; });
  },
});

export const { logout, setDeliveryAddress, clearError, setApiConnected } = authSlice.actions;
export default authSlice.reducer;
