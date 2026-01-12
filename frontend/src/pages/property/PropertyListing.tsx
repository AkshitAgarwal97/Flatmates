import React, { useEffect, useState } from "react";
import { Container, Typography, Box, CircularProgress, Alert, ToggleButton, ToggleButtonGroup, TextField, InputAdornment, Grid, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import SearchIcon from "@mui/icons-material/Search";
import ViewListIcon from "@mui/icons-material/ViewList";
import MapIcon from "@mui/icons-material/Map";
import HomeIcon from "@mui/icons-material/Home";
import AuthPromptDialog from "../../components/ui/AuthPromptDialog";
import PropertyMap from "../../components/ui/PropertyMap";
import EnhancedFilters, { EnhancedFiltersState } from "../../components/property/EnhancedFilters";
import PropertyCard from "../../components/property/PropertyCard";
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
  const [filters, setFilters] = useState<EnhancedFiltersState>({
    budgetRange: [0, 100000],
    propertyType: "all",
    listingType: "all",
    amenities: [],
    lifestyle: [],
    ageRange: [18, 65],
  });
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
    const apiFilters: any = {};
    if (debouncedSearchTerm) apiFilters.search = debouncedSearchTerm;
    if (filters.propertyType !== "all") apiFilters.propertyType = filters.propertyType;
    if (filters.listingType !== "all") apiFilters.listingType = filters.listingType;
    apiFilters.minPrice = filters.budgetRange[0];
    apiFilters.maxPrice = filters.budgetRange[1];
    if (filters.bedrooms) apiFilters.bedrooms = filters.bedrooms;
    if (filters.bathrooms) apiFilters.bathrooms = filters.bathrooms;
    if (filters.petFriendly !== undefined) apiFilters.petFriendly = filters.petFriendly;
    if (filters.amenities.length > 0) apiFilters.amenities = filters.amenities.join(',');
    if (filters.lifestyle.length > 0) apiFilters.lifestyle = filters.lifestyle.join(',');

    dispatch(getProperties(apiFilters));
  }, [dispatch, debouncedSearchTerm, filters]);

  useEffect(() => {
    if (properties) {
      setFilteredProperties(properties);
    }
  }, [properties]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFiltersChange = (newFilters: EnhancedFiltersState) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      budgetRange: [0, 100000],
      propertyType: "all",
      listingType: "all",
      amenities: [],
      lifestyle: [],
      ageRange: [18, 65],
    });
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

        {/* Enhanced Filters */}
        <EnhancedFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onReset={handleResetFilters}
        />

        {/* View Mode Toggle */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end' }}>
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
        </Box>
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
              <PropertyCard property={property} onViewDetails={handleViewDetails} />
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
