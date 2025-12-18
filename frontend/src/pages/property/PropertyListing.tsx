import React, { useEffect, useState, ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import { getProperties } from "../../redux/slices/propertySlice";
import { RootState, AppDispatch } from "../../redux/store";
import { Property, PropertyState } from "../../types"; // Import types from central location
import AuthPromptDialog from "../../components/ui/AuthPromptDialog";

// MUI components
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

// MUI icons
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import HomeIcon from "@mui/icons-material/Home";

const PropertyListing = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { properties, loading, error } = useSelector(
    (state: RootState) => state.property
  ) as PropertyState;
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    // Pass empty filters object to getProperties
    dispatch(getProperties({}));
  }, [dispatch]);

  useEffect(() => {
    if (properties) {
      const filtered = properties.filter((property) => {
        // Create a searchable address string from address object
        const addressString = property.address
          ? `${property.address.street || ""} ${property.address.city || ""} ${
              property.address.state || ""
            }`
          : "";

        return (
          property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          addressString.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (property.description?.toLowerCase() || "").includes(
            searchTerm.toLowerCase()
          )
        );
      });
      setFilteredProperties(filtered);
    } else {
      setFilteredProperties([]);
    }

  }, [properties, searchTerm]);
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleViewDetails = (propertyId: string) => {
    if (isAuthenticated) {
      navigate(`/properties/${propertyId}`);
    } else {
      setIsAuthDialogOpen(true);
    }
  };

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
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Property Listings
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" paragraph>
          Find your perfect flatmate or room
        </Typography>

        {/* Search Bar */}
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search properties by title, location, or description..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
      </Box>

      {filteredProperties.length === 0 ? (
        <Box textAlign="center" py={8}>
          <HomeIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No properties found
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            {searchTerm
              ? "Try adjusting your search terms."
              : "Be the first to list a property!"}
          </Typography>
          <Button
            variant="contained"
            component={RouterLink}
            to="/properties/create"
            size="large"
          >
            List Your Property
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProperties.map((property) => (
            <Grid item xs={12} sm={6} md={4} key={property._id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 4,
                  },
                }}
              >
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
                  alt={`Property: ${property.title} in ${property.address?.city || 'India'}`}
                  loading="lazy"
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h2">
                    {property.title}
                  </Typography>
                  <Box display="flex" alignItems="center" mb={1}>
                    <LocationOnIcon
                      sx={{ fontSize: 16, mr: 0.5, color: "text.secondary" }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {typeof property.address === "string"
                        ? property.address
                        : property.address
                        ? `${property.address.street || ""}, ${
                            property.address.city || ""
                          }, ${property.address.state || ""}`
                        : ""}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Typography 
                      variant="h6" 
                      color="primary" 
                      sx={{ fontWeight: 'bold', mr: 0.5 }}
                    >
                      ₹
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {property.price?.amount || 0}/month
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {property.description ? `${property.description.substring(0, 100)}...` : 'No description available'}
                  </Typography>
                  <Box display="flex" flexWrap="wrap" gap={0.5} mb={2}>
                    <Chip label={`${property.features?.bedrooms || property.bedrooms || 0} bed`} size="small" />
                    <Chip label={`${property.features?.bathrooms || property.bathrooms || 0} bath`} size="small" />
                    <Chip label={property.propertyType || 'N/A'} size="small" />
                  </Box>
                </CardContent>
                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="contained"
                    onClick={() => handleViewDetails(property._id)}
                  >
                    View Details
                  </Button>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
      <AuthPromptDialog 
        open={isAuthDialogOpen} 
        onClose={() => setIsAuthDialogOpen(false)} 
      />
    </Container>
  );
};

export default PropertyListing;
