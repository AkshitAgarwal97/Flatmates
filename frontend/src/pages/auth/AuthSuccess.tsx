import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import { CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { setToken, loadUser } from '../../redux/slices/authSlice';
import { AppDispatch } from '../../redux/store';

const AuthSuccess = () => {
  const navigate = useNavigate();
  const dispatch: AppDispatch = useDispatch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    const error = searchParams.get('error');

    if (error) {
      // Handle authentication error
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            error: 'Authentication failed. Please try again.' 
          } 
        });
      }, 3000);
      return;
    }

    // Accept token-only flow and rely on API to fetch the user profile
    if (token) {
      try {
        // Store token in localStorage
        localStorage.setItem('token', token);
        
        // Update Redux state and load user
        dispatch(setToken(token));
        dispatch(loadUser());
        
        // Redirect shortly after setting up session
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } catch (err) {
        console.error('Error handling auth success:', err);
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              error: 'Authentication data error. Please try again.' 
            } 
          });
        }, 3000);
      }
    } else {
      // Missing required parameters
      setTimeout(() => {
        navigate('/login', { 
          state: { 
            error: 'Authentication incomplete. Please try again.' 
          } 
        });
      }, 3000);
    }
  }, [searchParams, dispatch, navigate]);

  const error = searchParams.get('error');

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        {error ? (
          <>
            <Alert severity="error" sx={{ mb: 3 }}>
              Authentication failed: {error}
            </Alert>
            <Typography variant="body1" color="text.secondary">
              Redirecting to login page...
            </Typography>
          </>
        ) : (
          <>
            <Box sx={{ mb: 3 }}>
              <CheckCircleIcon 
                sx={{ 
                  fontSize: 64, 
                  color: 'success.main',
                  mb: 2 
                }} 
              />
            </Box>
            
            <Typography variant="h4" component="h1" gutterBottom>
              Authentication Successful!
            </Typography>
            
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Welcome to Flatmates! Setting up your account...
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
            
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
              You will be redirected shortly.
            </Typography>
          </>
        )}
      </Paper>
    </Container>
  );
};

export default AuthSuccess;