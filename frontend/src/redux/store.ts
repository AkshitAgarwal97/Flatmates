import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';
import authReducer from './slices/authSlice';
import propertyReducer from './slices/propertySlice';
import messageReducer from './slices/messageSlice';
import alertReducer from './slices/alertSlice';
import passwordResetReducer from './slices/passwordResetSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    property: propertyReducer,
    message: messageReducer,
    alert: alertReducer,
    passwordReset: passwordResetReducer
  },
  devTools: process.env.NODE_ENV !== 'production'
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Export typed hooks for better TypeScript support
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;