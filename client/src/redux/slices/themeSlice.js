import { createSlice } from '@reduxjs/toolkit';

const stored = localStorage.getItem('agrilink_theme') || 'light';

const themeSlice = createSlice({
  name: 'theme',
  initialState: { mode: stored },
  reducers: {
    toggleTheme: (state) => {
      state.mode = state.mode === 'light' ? 'dark' : 'light';
      localStorage.setItem('agrilink_theme', state.mode);
    },
    setTheme: (state, action) => {
      state.mode = action.payload;
      localStorage.setItem('agrilink_theme', state.mode);
    },
  },
});

export const { toggleTheme, setTheme } = themeSlice.actions;
export default themeSlice.reducer;
