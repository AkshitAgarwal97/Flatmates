import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

const NotFound = () => {
  return (
    <Container maxWidth="md">
      <Paper
        elevation={3}
        sx={{
          p: 4,
          mt: 8,
          mb: 8,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Grid container spacing={3} direction="column" alignItems="center">
          <Grid item>
            <SentimentDissatisfiedIcon sx={{ fontSize: 100, color: 'text.secondary' }} />
          </Grid>
          <Grid item>
            <Typography variant="h2" component="h1" gutterBottom>
              404
            </Typography>
            <Typography variant="h4" component="h2" gutterBottom>
              Page Not Found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              The page you are looking for might have been removed, had its name changed,
              or is temporarily unavailable.
            </Typography>
          </Grid>
          <Grid item>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                color="primary"
                component={RouterLink}
                to="/"
                size="large"
              >
                Go to Homepage
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default NotFound;