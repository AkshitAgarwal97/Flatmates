import React from 'react';
import { 
  Card, 
  CardContent, 
  CardMedia, 
  Typography, 
  Box, 
  Chip, 
  Button, 
  Rating,
  Stack
} from '@mui/material';
import { 
  LocalShipping as ShippingIcon, 
  CleaningServices as CleaningIcon, 
  Chair as FurnitureIcon, 
  Wifi as InternetIcon,
  Star as StarIcon
} from '@mui/icons-material';

interface Service {
  _id: string;
  name: string;
  type: string;
  description: string;
  priceRange: string;
  contactInfo: {
    phone?: string;
    website?: string;
  };
  rating: number;
  logo?: string;
  isPromoted: boolean;
}

const getServiceIcon = (type: string) => {
  switch (type) {
    case 'movers': return <ShippingIcon />;
    case 'cleaning': return <CleaningIcon />;
    case 'furniture_rental': return <FurnitureIcon />;
    case 'internet': return <InternetIcon />;
    default: return <ShippingIcon />;
  }
};

const ServiceCard: React.FC<{ service: Service }> = ({ service }) => {
  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s',
        '&:hover': { transform: 'translateY(-4px)' }
      }}
    >
      {service.isPromoted && (
        <Chip 
          label="Featured" 
          color="secondary" 
          size="small" 
          sx={{ 
            position: 'absolute', 
            top: 10, 
            right: 10, 
            zIndex: 1,
            fontWeight: 'bold'
          }} 
        />
      )}
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center', bgcolor: 'grey.50' }}>
         {service.logo ? (
           <CardMedia
             component="img"
             sx={{ height: 80, objectFit: 'contain' }}
             image={service.logo}
             alt={service.name}
           />
         ) : (
           <Box sx={{ height: 80, display: 'flex', alignItems: 'center', color: 'primary.main' }}>
             {getServiceIcon(service.type)}
           </Box>
         )}
      </Box>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2">
          {service.name}
        </Typography>
        <Box display="flex" alignItems="center" mb={1}>
          <Rating value={service.rating} precision={0.5} readOnly size="small" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
            ({service.rating})
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" paragraph>
          {service.description.length > 80 ? `${service.description.substring(0, 80)}...` : service.description}
        </Typography>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mt="auto">
          <Typography variant="subtitle2" color="primary.main">
            {service.priceRange}
          </Typography>
          <Button 
            variant="contained" 
            size="small"
            onClick={() => window.open(service.contactInfo.website || '#', '_blank')}
          >
            Visit
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
