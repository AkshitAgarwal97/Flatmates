import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box
} from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

interface AuthPromptDialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

const AuthPromptDialog: React.FC<AuthPromptDialogProps> = ({
  open,
  onClose,
  title = "Login Required",
  message = "Please log in or register to view full property details and contact owners."
}) => {
  const navigate = useNavigate();

  const handleLogin = () => {
    onClose();
    navigate('/login');
  };

  const handleRegister = () => {
    onClose();
    navigate('/register');
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      aria-labelledby="auth-prompt-title"
      aria-describedby="auth-prompt-description"
    >
      <DialogTitle id="auth-prompt-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="auth-prompt-description">
          {message}
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 2 }}>
        <Button 
          variant="outlined" 
          onClick={handleLogin}
          startIcon={<LoginIcon />}
          fullWidth
        >
          Login
        </Button>
        <Button 
          variant="contained" 
          onClick={handleRegister}
          startIcon={<PersonAddIcon />}
          fullWidth
        >
          Register
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AuthPromptDialog;
