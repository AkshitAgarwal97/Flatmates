
import React, { useEffect, useState, ChangeEvent, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link as RouterLink, useSearchParams } from "react-router-dom";
import { getProperties, clearError } from "../../redux/slices/propertySlice";
import { RootState, AppDispatch } from "../../redux/store";
import { Property, PropertyState } from "../../types";
import AuthPromptDialog from "../../components/ui/AuthPromptDialog";
import EnhancedFilters, { EnhancedFiltersState } from "../../components/property/EnhancedFilters";
import FilterListIcon from "@mui/icons-material/FilterList";

// MUI components
import {
  Container,
  Grid,
  Typography,
  Button,
  Box,
  TextField,
  CircularProgress,
  Pagination,
  Drawer,
  useTheme,
  useMediaQuery,
  Fab,
  Chip,
  Stack,
} from "@mui/material";
import PropertyCard from "../../components/property/PropertyCard";

const initialFilters: EnhancedFiltersState = {
  budgetRange: [0, 100000000],
  propertyType: "all",
  listingType: "all",
  amenities: [],
  lifestyle: [],
  ageRange: [18, 60],
  occupation: "Any",
  search: "",
};

const PropertyList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { properties, loading, error, pagination } = useSelector(
    (state: RootState) => state.property as PropertyState
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filters, setFilters] = useState<EnhancedFiltersState>(initialFilters);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [searchParams] = useSearchParams();
  const [searchRadius, setSearchRadius] = useState<number | null>(null);
  const [isRadiusSearching, setIsRadiusSearching] = useState(false);
  
  // Initialize filters from URL params on mount
  useEffect(() => {
    const urlSearch = searchParams.get('search');
    const urlType = searchParams.get('type');
    const urlMaxPrice = searchParams.get('maxPrice');
    
    setFilters(prev => ({
      ...prev,
      search: urlSearch || "",
      propertyType: urlType || "all",
      budgetRange: urlMaxPrice ? [0, parseInt(urlMaxPrice)] : prev.budgetRange
    }));
    
    if (urlSearch) {
      setSearchTerm(urlSearch);
    }
  }, [searchParams]);
  
  // Debounce search term to update filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchPropertiesWithRadius = async (lat: number, lng: number, radius: number, accumulatedProperties: Property[] = []) => {
    const queryParams: any = {
      ...filters,
      lat: lat.toString(),
      lng: lng.toString(),
      radius: radius.toString(),
      page: 1,
      limit: 1000 // Get all properties within radius
    };

    // Map budgetRange to minPrice and maxPrice
    if (filters.budgetRange && filters.budgetRange.length === 2) {
      queryParams.minPrice = filters.budgetRange[0];
      queryParams.maxPrice = filters.budgetRange[1];
    }

    try {
      const result = await dispatch(getProperties(queryParams)).unwrap();
      const newProperties = result.properties || [];
      const combined = [...accumulatedProperties, ...newProperties];
      
      // Continue expanding radius until 50km
      if (radius < 50) {
        setSearchRadius(radius + 5);
        setTimeout(() => {
          fetchPropertiesWithRadius(lat, lng, radius + 5, combined);
        }, 500);
      } else {
        // Reached 50km, stop searching
        setIsRadiusSearching(false);
        setSearchRadius(null);
      }
    } catch (error) {
      console.error('Error fetching properties with radius:', error);
      setIsRadiusSearching(false);
    }
  };

  const fetchProperties = () => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');

    // If coordinates provided, use progressive radius search
    if (lat && lng && !isRadiusSearching) {
      setIsRadiusSearching(true);
      setSearchRadius(5);
      fetchPropertiesWithRadius(parseFloat(lat), parseFloat(lng), 5, []);
      return;
    }

    // Regular search without coordinates
    const queryParams: any = {
      ...filters,
      page: pagination.page,
      limit: pagination.limit
    };

    // Map budgetRange to minPrice and maxPrice
    if (filters.budgetRange && filters.budgetRange.length === 2) {
      queryParams.minPrice = filters.budgetRange[0];
      queryParams.maxPrice = filters.budgetRange[1];
    }

    dispatch(getProperties(queryParams)); 
  };

  useEffect(() => {
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    
    // Skip if radius search is active or will be triggered
    if (lat && lng) {
      return;
    }
    
    dispatch(clearError());
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, filters, pagination.page]); 

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleFiltersChange = (newFilters: EnhancedFiltersState) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({ ...initialFilters, search: searchTerm });
  };

  const handleViewDetails = (propertyId: string) => {
    if (isAuthenticated) {
      navigate(`/properties/${propertyId}`);
    } else {
      setIsAuthDialogOpen(true);
    }
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    // Dispatch action to set page in redux, which triggers fetch due to dependency
    // Actually propertySlice.setPage only updates state, we need to trigger fetch potentially
    // Or just fetch with new page
        const queryParams: any = {
          ...filters,
          page: value,
          limit: pagination.limit
        };

        if (filters.budgetRange && filters.budgetRange.length === 2) {
          queryParams.minPrice = filters.budgetRange[0];
          queryParams.maxPrice = filters.budgetRange[1];
        }

        dispatch(getProperties(queryParams));
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Mobile Filter Button (Floating) */}
      <Box sx={{ display: { xs: 'block', md: 'none' }, position: 'fixed', bottom: 80, right: 16, zIndex: 1000 }}>
         <Fab variant="extended" color="primary" onClick={handleDrawerToggle}>
            <FilterListIcon sx={{ mr: 1 }} />
            Filters
         </Fab>
      </Box>

      {/* Mobile Filter Drawer */}
      <Drawer
        variant="temporary"
        anchor="left" // or bottom
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", md: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 300 },
        }}
      >
        <Box p={2}>
           <EnhancedFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
            />
        </Box>
      </Drawer>

      <Grid container spacing={3}>
        {/* Desktop Sidebar Filters */}
        <Grid item md={3} sx={{ display: { xs: "none", md: "block" } }}>
           <EnhancedFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onReset={handleResetFilters}
            />
        </Grid>

        {/* Property List */}
        <Grid item xs={12} md={9}>
           {/* Search Bar */}
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by title, location, or description..."
              value={searchTerm}
              onChange={handleSearchChange}
              size="small"
              sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
            />
          </Box>
          
          {/* Search Status Message */}
          {isRadiusSearching && searchRadius && (
            <Box sx={{ mb: 2, p: 2, bgcolor: 'info.light', borderRadius: 2 }}>
              <Typography variant="body2" color="info.contrastText">
                🔍 Searching for properties within {searchRadius}km of your location...
              </Typography>
            </Box>
          )}
          
          {/* Active Filters Display (Optional, can be added here) */}
          
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box p={3}>
              <Typography color="error">{error}</Typography>
            </Box>
          ) : properties.length === 0 ? (
            <Box textAlign="center" py={8}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No properties found matching your criteria.
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Try adjusting your filters or search term.
              </Typography>
               <Button onClick={handleResetFilters} variant="outlined" sx={{ mt: 1 }}>
                  Reset Filters
               </Button>
               <Box mt={4}>
                  <Button
                    component={RouterLink}
                    to="/properties/create"
                    variant="contained"
                  >
                    Post a Listing
                  </Button>
               </Box>
            </Box>
          ) : (
            <>
              <Box mb={2}>
                <Typography variant="subtitle2" color="text.secondary">
                    Showing {properties.length} results
                </Typography>
              </Box>

              <Grid container spacing={3}>
                {properties.map((property) => (
                  <Grid item xs={12} sm={6} lg={4} key={property._id}>
                    <PropertyCard property={property} onViewDetails={handleViewDetails} />
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {pagination && pagination.pages > 1 && (
                <Box display="flex" justifyContent="center" mt={6}>
                  <Pagination
                    count={pagination.pages}
                    page={pagination.page}
                    onChange={handlePageChange}
                    color="primary"
                    shape="rounded"
                    size="large"
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>

      <AuthPromptDialog
        open={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
      />
    </Container>
  );
};

export default PropertyList;
