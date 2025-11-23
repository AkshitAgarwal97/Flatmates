import React, { useEffect, useState, ChangeEvent } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { getProperties } from "../../redux/slices/propertySlice";
import { RootState, AppDispatch } from "../../redux/store";
import { PropertyState, Property } from "../../types";

// MUI components
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  TextField,
  CircularProgress,
  Pagination,
} from "@mui/material";

const PropertyList: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { properties, loading, error } = useSelector(
    (state: RootState) => state.property as PropertyState
  );

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [propertiesPerPage] = useState<number>(9);
  const [filteredProperties, setFilteredProperties] = useState<Property[]>([]);

  useEffect(() => {
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
    }
  }, [properties, searchTerm]);

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setCurrentPage(value);
  };

  // Get current properties
  const indexOfLastProperty = currentPage * propertiesPerPage;
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage;
  const currentProperties = filteredProperties.slice(
    indexOfFirstProperty,
    indexOfLastProperty
  );

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

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by title, location, or description..."
          value={searchTerm}
          onChange={handleSearchChange}
          sx={{ mb: 2 }}
        />
      </Box>

      {currentProperties.length === 0 ? (
        <Box textAlign="center" py={4}>
          <Typography variant="h6">
            No properties found matching your search criteria.
          </Typography>
          <Button
            component={RouterLink}
            to="/properties/create"
            variant="contained"
            sx={{ mt: 2 }}
          >
            Add Property
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3}>
            {currentProperties.map((property) => (
              <Grid item xs={12} sm={6} md={4} key={property._id}>
                <Card>
                  <Box
                    sx={{
                      height: 200,
                      backgroundImage: `url(${
                        property.images?.[0] || "/default-property.jpg"
                      })`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                    }}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h6" component="h2">
                      {property.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {property.address.city}, {property.address.state}
                    </Typography>
                    <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                      $
                      {typeof property.price === "number"
                        ? property.price
                        : String(property.price)}
                      /month
                    </Typography>
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        {property.bedrooms} beds • {property.bathrooms} baths
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {property.propertyType}
                      </Typography>
                    </Box>
                    <Button
                      component={RouterLink}
                      to={`/properties/${property._id}`}
                      variant="contained"
                      fullWidth
                      sx={{ mt: 2 }}
                    >
                      View Details
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Pagination */}
          <Box display="flex" justifyContent="center" mt={4}>
            <Pagination
              count={Math.ceil(filteredProperties.length / propertiesPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              color="primary"
            />
          </Box>
        </>
      )}
    </Container>
  );
};

export default PropertyList;
