import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch } from '../store';

export interface Alert {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface AlertState {
  alerts: Alert[];
}

const initialState: AlertState = {
  alerts: []
};

const alertSlice = createSlice({
  name: 'alert',
  initialState,
  reducers: {
    setAlert: (state, action: PayloadAction<Alert>) => {
      const { id, type, message } = action.payload;
      state.alerts = [...state.alerts, { id, type, message }];
    },
    removeAlert: (state, action: PayloadAction<number>) => {
      state.alerts = state.alerts.filter(alert => alert.id !== action.payload);
    },
    clearAlerts: (state) => {
      state.alerts = [];
    }
  }
});

export const { setAlert, removeAlert, clearAlerts } = alertSlice.actions;

// Helper function to dispatch alerts with auto-removal
export const showAlert = (
  type: Alert['type'], 
  message: string, 
  timeout: number = 5000
) => (dispatch: AppDispatch) => {
  const id = Date.now();
  dispatch(setAlert({ id, type, message }));
  
  setTimeout(() => {
    dispatch(removeAlert(id));
  }, timeout);
};

export default alertSlice.reducer;