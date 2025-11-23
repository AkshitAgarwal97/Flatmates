import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
}

const PrivateRoute = () => {
  const { isAuthenticated, loading } = useSelector((state: { auth: AuthState }) => state.auth);

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh'
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated, otherwise render the protected component
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;