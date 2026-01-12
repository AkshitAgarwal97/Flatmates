import React, { useEffect } from "react";
import { useParams, Navigate, Link as RouterLink } from "react-router-dom";
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Paper, 
  Chip, 
  Breadcrumbs, 
  Link,
  Divider,
  Button
} from "@mui/material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { getCityBySlug } from "../../config/cities";
import PropertyCard from "../../components/property/PropertyCard";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { getProperties } from "../../redux/slices/propertySlice";
import CircularProgress from "@mui/material/CircularProgress";

const CityLandingPage: React.FC = () => {
  const { citySlug } = useParams<{ citySlug: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const city = citySlug ? getCityBySlug(citySlug) : null;
  
  const { properties, loading } = useSelector((state: RootState) => state.property);

  useEffect(() => {
    if (city) {
      document.title = city.title;
      // Fetch properties for this city
      dispatch(getProperties({ city: city.name, limit: 6 } as any));
    }
  }, [city, dispatch]);

  if (!city) {
    return <Navigate to="/404" />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Breadcrumbs */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link component={RouterLink} to="/" color="inherit" underline="hover">
          Home
        </Link>
        <Link component={RouterLink} to="/properties" color="inherit" underline="hover">
          Properties
        </Link>
        <Typography color="text.primary">{city.name}</Typography>
      </Breadcrumbs>

      {/* Hero Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="primary">
          Flats & Roommates in {city.name}
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ mb: 3, maxWidth: '800px' }}>
          {city.description}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {city.keywords.map((kw) => (
            <Chip key={kw} label={`#${kw}`} variant="outlined" size="small" />
          ))}
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Main Content: Property Listings */}
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5" component="h2" fontWeight="medium">
                Latest Listings in {city.name}
            </Typography>
            <Button 
                component={RouterLink} 
                to={`/properties?city=${city.name}`} 
                variant="text" 
                color="primary"
            >
                View All
            </Button>
          </Box>

          {loading ? (
            <Box display="flex" justifyContent="center" py={4}>
              <CircularProgress />
            </Box>
          ) : properties.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center', bgcolor: '#f9f9f9' }}>
               <Typography color="text.secondary">
                 No listings found in {city.name} specifically. Be the first to post!
               </Typography>
               <Button 
                component={RouterLink} 
                to="/properties/create" 
                variant="contained" 
                sx={{ mt: 2 }}
               >
                 Post a Property
               </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              {properties.slice(0, 6).map((property) => (
                <Grid item xs={12} sm={6} key={property._id}>
                  <PropertyCard 
                    property={property} 
                    onViewDetails={(id) => window.location.href = `/properties/${id}`} 
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* Sidebar: Area Guides */}
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, bgcolor: '#f5f7fa', borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom display="flex" alignItems="center">
              <LocationOnIcon sx={{ mr: 1, color: 'primary.main' }} />
              Popular Areas in {city.name}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {city.popularAreas.map((area) => (
                <Link 
                  key={area} 
                  component={RouterLink} 
                  to={`/properties?city=${city.name}&search=${area}`}
                  underline="hover"
                  color="text.primary"
                  sx={{ 
                    p: 1.5, 
                    borderRadius: 1,
                    '&:hover': { bgcolor: 'white', color: 'primary.main' }
                  }}
                >
                  {area}
                </Link>
              ))}
            </Box>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, mt: 3, bgcolor: 'primary.main', color: 'white', borderRadius: 2 }}>
             <Typography variant="h6" gutterBottom>
               Moving to {city.name}?
             </Typography>
             <Typography variant="body2" sx={{ mb: 2, opacity: 0.9 }}>
               Get flatmates and rooms within minutes. Trusted by thousands of people in {city.name}.
             </Typography>
             <Button 
                component={RouterLink} 
                to="/register" 
                variant="contained" 
                color="secondary" 
                fullWidth
             >
               Get Started
             </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CityLandingPage;
