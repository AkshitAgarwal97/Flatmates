import React from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Paper, 
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';

const PrivacyPolicy: React.FC = () => {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: { xs: 3, md: 6 }, borderRadius: 3 }}>
        <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
          Privacy Policy
        </Typography>
        <Typography variant="body2" color="text.secondary" paragraph>
          Last Updated: December 18, 2025
        </Typography>
        
        <Divider sx={{ my: 4 }} />

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            1. Introduction
          </Typography>
          <Typography variant="body1" paragraph>
            Welcome to Flatmates.co.in. We are committed to protecting your personal data and your right to privacy. This Privacy Policy explains how we collect, use, and share information about you when you use our website.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            2. Information We Collect
          </Typography>
          <Typography variant="body1" paragraph>
            We collect information that you provide directly to us, such as when you create an account, list a property, or communicate with other users:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Personal Information" secondary="Name, email address, phone number, and profile picture." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Listing Information" secondary="Property details, photos, and preferences." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Communications" secondary="Messages sent through our platform to other users." />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            3. How We Use Your Information
          </Typography>
          <Typography variant="body1" paragraph>
            We use the information we collect to:
          </Typography>
          <List>
            <ListItem>
              <ListItemText primary="Provide and maintain our services." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Facilitate connections between flatmates and owners." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Send you security alerts and administrative messages." />
            </ListItem>
            <ListItem>
              <ListItemText primary="Improve and personalize your experience." />
            </ListItem>
          </List>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            4. Data Security
          </Typography>
          <Typography variant="body1" paragraph>
            We implement appropriate technical and organizational measures to protect the security of your personal information. However, please remember that no method of transmission over the internet is 100% secure.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            5. Contact Us
          </Typography>
          <Typography variant="body1">
            If you have any questions about this Privacy Policy, please contact us at support@flatmates.co.in.
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicy;
