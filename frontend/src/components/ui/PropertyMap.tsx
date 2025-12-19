import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property } from '../../types';
import { Box, Typography, Button } from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';

// Fix for default marker icon in Leaflet + React
// @ts-ignore
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
// @ts-ignore
import markerIcon from 'leaflet/dist/images/marker-icon.png';
// @ts-ignore
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface PropertyMapProps {
  properties: Property[];
  onViewDetails: (id: string) => void;
}

const PropertyMap: React.FC<PropertyMapProps> = ({ properties, onViewDetails }) => {
  // Center of India roughly
  const center: [number, number] = [20.5937, 78.9629];
  
  // Try to center on the first property if it has coordinates, otherwise use default
  const mapCenter: [number, number] = properties.length > 0 && properties[0].address?.coordinates
    ? [properties[0].address.coordinates.lat, properties[0].address.coordinates.lng]
    : center;

  const zoom = properties.length > 0 && properties[0].address?.coordinates ? 12 : 5;

  return (
    <Box sx={{ height: '600px', width: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
      <MapContainer center={mapCenter} zoom={zoom} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {properties.map((property) => {
          if (!property.address?.coordinates) return null;
          
          return (
            <Marker 
              key={property._id} 
              position={[property.address.coordinates.lat, property.address.coordinates.lng]}
            >
              <Popup>
                <Box sx={{ p: 1, maxWidth: 200 }}>
                  <Typography variant="subtitle2" fontWeight="bold">
                    {property.title}
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
                    ₹{property.price?.amount || 0}/month
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="small" 
                    fullWidth 
                    onClick={() => onViewDetails(property._id)}
                  >
                    View Details
                  </Button>
                </Box>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </Box>
  );
};

export default PropertyMap;
