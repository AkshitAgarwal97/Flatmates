import React from 'react';
import { useSelector } from 'react-redux';
import { Alert as MuiAlert, Snackbar, Stack } from '@mui/material';

interface AlertType {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface AlertState {
  alerts: AlertType[];
}

const Alert = () => {
  const { alerts } = useSelector((state: { alert: AlertState }) => state.alert);

  if (alerts.length === 0) return null;

  return (
    <Stack spacing={2} sx={{ width: '100%', position: 'fixed', top: 70, right: 20, zIndex: 9999 }}>
      {alerts.map((alert) => (
        <Snackbar
          key={alert.id}
          open={true}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MuiAlert
            elevation={6}
            variant="filled"
            severity={alert.type}
            sx={{ width: '100%' }}
          >
            {alert.message}
          </MuiAlert>
        </Snackbar>
      ))}
    </Stack>
  );
};

export default Alert;