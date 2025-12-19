import React, { useEffect, useState } from "react";
import { Container, Typography, Box, CircularProgress, Alert, Paper, ToggleButton, ToggleButtonGroup, MenuItem, Slider, Divider, Stack, Select, FormControl, InputLabel, TextField, InputAdornment, Grid, Card, CardContent, CardMedia, Button, Chip } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import ViewListIcon from "@mui/icons-material/ViewList";
import MapIcon from "@mui/icons-material/Map";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VerifiedIcon from "@mui/icons-material/Verified";
import BeenhereIcon from "@mui/icons-material/Beenhere";
import HomeIcon from "@mui/icons-material/Home";
import AuthPromptDialog from "../../components/ui/AuthPromptDialog";
import PropertyMap from "../../components/ui/PropertyMap";
import { useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector, RootState } from "../../redux/store";
import { getProperties } from "../../redux/slices/propertySlice";
import { Property, PropertyState } from "../../types";

const PropertyListing = () => {
  const dispatch = useAppDispatch();
  const { properties, loading, error } = useAppSelector(
    (state: RootState) => state.property
  ) as PropertyState;
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
  const [budgetRange, setBudgetRange] = useState<number[]>([0, 100000]);
  const [propertyType, setPropertyType] = useState<string>("all");
  const [listingType, setListingType] = useState<string>("all");
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const { isAuthenticated } = useAppSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    const filters: any = {};
    if (debouncedSearchTerm) filters.search = debouncedSearchTerm;
    if (propertyType !== "all") filters.propertyType = propertyType;
    if (listingType !== "all") filters.listingType = listingType;
    filters.minPrice = budgetRange[0];
    filters.maxPrice = budgetRange[1];

    dispatch(getProperties(filters));
  }, [dispatch, debouncedSearchTerm, budgetRange, propertyType, listingType]);

  useEffect(() => {
    if (properties) {
      setFilteredProperties(properties);
    }
  }, [properties]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleBudgetChange = (event: Event, newValue: number | number[]) => {
    setBudgetRange(newValue as number[]);
  };

  const handlePropertyTypeChange = (event: any) => {
    setPropertyType(event.target.value as string);
  };

  const handleListingTypeChange = (event: any) => {
    setListingType(event.target.value as string);
  };

  const handleViewModeChange = (
    event: React.MouseEvent<HTMLElement>,
    nextView: "list" | "map" | null
  ) => {
    if (nextView !== null) {
      setViewMode(nextView);
    }
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
          label="Search Properties"
          placeholder="Search properties by title, location, or description..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon aria-hidden="true" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />

        {/* Multi-Filter Bar */}
        <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <Typography variant="caption" color="text.secondary" gutterBottom display="block">
                Budget Range: ₹{budgetRange[0]} - ₹{budgetRange[1]}+
              </Typography>
              <Slider
                value={budgetRange}
                onChange={handleBudgetChange}
                valueLabelDisplay="auto"
                min={0}
                max={100000}
                step={1000}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={propertyType}
                  label="Property Type"
                  onChange={handlePropertyTypeChange}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="apartment">Apartment</MenuItem>
                  <MenuItem value="house">House</MenuItem>
                  <MenuItem value="pg">PG/Hostel</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Listing Type</InputLabel>
                <Select
                  value={listingType}
                  label="Listing Type"
                  onChange={handleListingTypeChange}
                >
                  <MenuItem value="all">All Listings</MenuItem>
                  <MenuItem value="room_seeker">Find Flatmate</MenuItem>
                  <MenuItem value="property_owner">Full Property</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={handleViewModeChange}
                aria-label="view mode"
                size="small"
              >
                <ToggleButton value="list" aria-label="list view">
                  <ViewListIcon sx={{ mr: 1 }} /> List
                </ToggleButton>
                <ToggleButton value="map" aria-label="map view">
                  <MapIcon sx={{ mr: 1 }} /> Map
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {filteredProperties.length === 0 ? (
        <Box textAlign="center" py={8}>
          <HomeIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
          <Typography variant="h5" component="h2" gutterBottom>
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
      ) : viewMode === "list" ? (
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
                <Box sx={{ position: 'relative' }}>
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
                  {property.propertyVerified && (
                    <Chip
                      icon={<BeenhereIcon sx={{ fontSize: '14px !important' }} />}
                      label="Verified Property"
                      size="small"
                      color="success"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        height: 24,
                        fontSize: '10px',
                        fontWeight: 'bold',
                        bgcolor: 'success.main',
                        color: 'white'
                      }}
                    />
                  )}
                  {property.isVerified && (
                    <Chip
                      icon={<VerifiedIcon sx={{ fontSize: '14px !important' }} />}
                      label="Verified Owner"
                      size="small"
                      color="info"
                      sx={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        height: 24,
                        fontSize: '10px',
                        fontWeight: 'bold',
                        bgcolor: 'info.main',
                        color: 'white'
                      }}
                    />
                  )}
                </Box>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h6" component="h3">
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
      ) : (
        <PropertyMap properties={filteredProperties} onViewDetails={handleViewDetails} />
      )}
      <AuthPromptDialog 
        open={isAuthDialogOpen} 
        onClose={() => setIsAuthDialogOpen(false)} 
      />
    </Container>
  );
};

export default PropertyListing;
