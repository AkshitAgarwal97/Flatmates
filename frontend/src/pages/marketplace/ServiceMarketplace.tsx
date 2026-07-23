import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Paper,
} from "@mui/material";
import {
  LocalShipping as ShippingIcon,
  CleaningServices as CleaningIcon,
  Chair as FurnitureIcon,
  Wifi as InternetIcon,
} from "@mui/icons-material";
import { serviceAPI, extractResponseData } from "../../services/api";
import ServiceCard from "../../components/marketplace/ServiceCard";

const serviceTypes = [
  { label: "All", value: "all" },
  { label: "Packers & Movers", value: "movers", icon: <ShippingIcon /> },
  { label: "Cleaning", value: "cleaning", icon: <CleaningIcon /> },
  {
    label: "Furniture Rental",
    value: "furniture_rental",
    icon: <FurnitureIcon />,
  },
  { label: "Broadband", value: "internet", icon: <InternetIcon /> },
];

const ServiceMarketplace: React.FC = () => {
  React.useEffect(() => {
    document.title = "Service Marketplace | Flatmates";
  }, []);
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        setLoading(true);
        const type = serviceTypes[tabValue].value;
        const url =
          type === "all" ? "/api/services" : `/api/services?type=${type}`;
        const res = await serviceAPI.getServices(type);
        const data = extractResponseData(res as any) as any;
        setServices(Array.isArray(data) ? data : data.services || data);
      } catch (err) {
        console.error("Error fetching services:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, [tabValue]);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" fontWeight="900" gutterBottom color="primary">
          House Services
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Trusted helpers for your new home
        </Typography>
      </Box>

      <Paper sx={{ mb: 4, borderRadius: 2 }}>
        <Tabs
          value={tabValue}
          onChange={(_, val) => setTabValue(val)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{ borderBottom: 1, borderColor: "divider" }}
        >
          {serviceTypes.map((type, index) => (
            <Tab
              key={index}
              label={type.label}
              icon={type.icon}
              iconPosition="start"
              sx={{ minHeight: 64 }}
            />
          ))}
        </Tabs>
      </Paper>

      {loading ? (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      ) : services.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography variant="h6" color="text.secondary">
            No services found in this category yet.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {services.map((service) => (
            <Grid item key={service._id} xs={12} sm={6} md={4}>
              <ServiceCard service={service} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Trust Banner */}
      <Box
        mt={8}
        p={4}
        bgcolor="primary.main"
        color="white"
        borderRadius={3}
        textAlign="center"
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Verified & Reliable Services
        </Typography>
        <Typography variant="body1">
          Every partner on our platform is hand-picked and verified for quality
          service.
        </Typography>
      </Box>
    </Container>
  );
};

export default ServiceMarketplace;
