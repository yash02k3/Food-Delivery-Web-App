import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import themeReducer from './slices/themeSlice';
import wishlistReducer from './slices/wishlistSlice';

const persistConfig = {
  key: 'agrilink',
  storage,
  whitelist: ['cart', 'auth', 'theme'],
};

const rootReducer = combineReducers({
  auth: authReducer,
  cart: cartReducer,
  theme: themeReducer,
  wishlist: wishlistReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'] },
    }),
});

export const persistor = persistStore(store);
