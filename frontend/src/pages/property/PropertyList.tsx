
import React, { useEffect, useState, ChangeEvent, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link as RouterLink } from "react-router-dom";
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
  
  // Debounce search term to update filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: searchTerm }));
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProperties = () => {
    // Convert EnhancedFiltersState to API query params format if needed
    // propertySlice handles most, but we need to ensure types match
    dispatch(getProperties({
      ...filters,
      page: pagination.page, 
      limit: pagination.limit
    } as any)); 
  };

  useEffect(() => {
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
    dispatch(getProperties({
        ...filters,
        page: value,
        limit: pagination.limit
    } as any));
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
