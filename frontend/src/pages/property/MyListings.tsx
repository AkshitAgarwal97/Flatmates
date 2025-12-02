import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { getUserListings } from "../../redux/slices/propertySlice";
import { RootState, AppDispatch } from "../../redux/store";
import { Property } from "../../types";

// MUI components
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

// MUI icons
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";

const MyListings = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { userListings, loading, error } = useSelector(
    (state: RootState) => state.property as any
  );

  useEffect(() => {
    dispatch(getUserListings());
  }, [dispatch]);
console.log(userListings);
  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
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
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error">{typeof error === 'string' ? error : (error as any).msg || 'An error occurred'}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h3" component="h1">
          My Listings
        </Typography>
        <Button
          component={RouterLink}
          to="/properties/create"
          variant="contained"
          startIcon={<AddIcon />}
        >
          Add New Property
        </Button>
      </Box>

      {userListings && userListings.length > 0 ? (
        <Grid container spacing={3}>
          {userListings.map((property: Property) => (
            <Grid item key={property._id} xs={12} sm={6} md={4}>
              <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
                <CardMedia
                  component="img"
                  height="200"
                  image={
                    property.images?.[0]?.url
                      ? (property.images[0].url.startsWith('http') 
                          ? property.images[0].url 
                          : `${process.env.REACT_APP_API_URL || ''}${property.images[0].url}`)
                      : "https://picsum.photos/seed/no-image-listing/300/200"
                  }
                  alt={property.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ mb: 1 }}>
                    <Chip 
                      label={property.status || 'Active'} 
                      color={property.status === 'inactive' ? 'default' : 'success'} 
                      size="small" 
                      sx={{ mr: 1 }}
                    />
                    <Chip label={property.propertyType} size="small" />
                  </Box>
                  <Typography gutterBottom variant="h5" component="h2">
                    {property.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {property.address.city}, {property.address.state}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ₹{property.price.amount}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    startIcon={<VisibilityIcon />}
                    component={RouterLink} 
                    to={`/properties/${property._id}`}
                  >
                    View
                  </Button>
                  <Button 
                    size="small" 
                    startIcon={<EditIcon />}
                    component={RouterLink} 
                    to={`/properties/edit/${property._id}`}
                  >
                    Edit
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h5" color="text.secondary" gutterBottom>
            You haven't created any listings yet.
          </Typography>
          <Button
            component={RouterLink}
            to="/properties/create"
            variant="contained"
            startIcon={<AddIcon />}
            sx={{ mt: 2 }}
          >
            Create Your First Listing
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default MyListings;
