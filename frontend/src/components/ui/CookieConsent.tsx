import React, { useState, useEffect } from 'react';
import { 
  Paper, 
  Typography, 
  Button, 
  Box, 
  Slide, 
  Link 
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CookieIcon from '@mui/icons-material/Cookie';

const CookieConsent: React.FC = () => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      setOpen(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieConsent', 'true');
    setOpen(false);
  };

  return (
    <Slide direction="up" in={open} mountOnEnter unmountOnExit>
      <Paper
        elevation={6}
        sx={{
          position: 'fixed',
          bottom: 20,
          left: { xs: 20, md: 40 },
          right: { xs: 20, md: 'auto' },
          maxWidth: { xs: 'none', md: 400 },
          p: 3,
          zIndex: 2000,
          borderRadius: 2,
          borderLeft: '5px solid',
          borderColor: 'primary.main',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CookieIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            We use cookies
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary">
          Flatmates uses cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies. Read our{" "}
          <Link component={RouterLink} to="/privacy" underline="always">
            Privacy Policy
          </Link>
          .
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
          <Button size="small" onClick={() => setOpen(false)}>
            Decline
          </Button>
          <Button variant="contained" size="small" onClick={handleAccept}>
            Accept All
          </Button>
        </Box>
      </Paper>
    </Slide>
  );
};

export default CookieConsent;
