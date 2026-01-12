import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { getSavedProperties } from "../../redux/slices/propertySlice";
import { RootState, AppDispatch } from "../../redux/store";
import { PropertyState } from "../../types";

// MUI components
import {
  Container,
  Grid,
  Typography,
  Box,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PropertyCard from "../../components/property/PropertyCard";

const SavedProperties: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { savedProperties, loading, error } = useSelector(
    (state: RootState) => state.property as PropertyState
  );

  useEffect(() => {
    dispatch(getSavedProperties());
  }, [dispatch]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="60vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" gap={2} mb={4}>
        <FavoriteIcon color="error" fontSize="large" />
        <Typography variant="h4" component="h1" fontWeight="bold">
          Saved Properties
        </Typography>
      </Box>

      {error && (
        <Box mb={3} p={2} bgcolor="error.light" borderRadius={1} color="error.contrastText">
            <Typography>{error}</Typography>
        </Box>
      )}

      {savedProperties.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: "center", borderRadius: 4, bgcolor: 'background.paper', border: '1px dashed' }}>
          <FavoriteIcon sx={{ fontSize: 60, color: 'text.disabled', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No saved properties yet.
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Properties you mark as favorite will appear here for easy access.
          </Typography>
          <Button
            component={RouterLink}
            to="/properties"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Browse Properties
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {savedProperties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property._id}>
              <PropertyCard property={property} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default SavedProperties;
