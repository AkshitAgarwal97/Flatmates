import React from "react";
import { useNavigate } from "react-router-dom";
import PropertyForm from "./PropertyForm";

// MUI components
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";

const CreateProperty = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            List Your Property
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Find the perfect flatmate for your property
          </Typography>
        </Box>

        <PropertyForm />
      </Paper>
    </Container>
  );
};

export default CreateProperty;
