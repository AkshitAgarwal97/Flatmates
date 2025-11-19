import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getPropertyById } from "../../redux/slices/propertySlice";
import PropertyForm from "./PropertyForm";

// MUI components
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import { useAppDispatch } from "../../redux/store";

const EditProperty = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { property, loading, error } = useSelector(
    (state: any) => state.property
  );
  const { user } = useSelector((state: any) => state.auth);

  useEffect(() => {
    if (id) {
      dispatch(getPropertyById(id) as any);
    }
  }, [dispatch, id]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">{String(error)}</Alert>
      </Container>
    );
  }

  if (!property) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">Property not found</Alert>
      </Container>
    );
  }

  // Check if user is the owner of the property
  if (property.owner?._id !== user?._id) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">
          You are not authorized to edit this property
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Edit Property
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Update your property details
          </Typography>
        </Box>
        <PropertyForm />
      </Paper>
    </Container>
  );
};

export default EditProperty;
