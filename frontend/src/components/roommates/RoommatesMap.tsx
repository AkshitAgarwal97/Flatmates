import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Roommate } from '../../types/roommate';
import { Box, Typography, Button, Avatar } from '@mui/material';

// Fix for default marker icon
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

interface RoommatesMapProps {
  roommates: Roommate[];
}

const RoommatesMap: React.FC<RoommatesMapProps> = ({ roommates }) => {
  // Center of Bangalore for demo
  const center: [number, number] = [12.9716, 77.5946];

  // Helper to generate consistent random coordinates around center
  const getCoordinates = (id: string, index: number): [number, number] => {
      // Deterministic random based on ID char codes
      const seed = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const latOffset = (seed % 1000) / 10000 - 0.05;
      const lngOffset = (seed % 500) / 5000 - 0.05;
      return [center[0] + latOffset, center[1] + lngOffset];
  };

  return (
    <Box sx={{ height: 'calc(100vh - 150px)', width: '100%', borderRadius: 2, overflow: 'hidden', border: '1px solid #ddd' }}>
      <MapContainer center={center} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {roommates.map((roommate, index) => {
          const position = getCoordinates(roommate.id, index);
          
          return (
            <Marker 
              key={roommate.id} 
              position={position}
            >
              <Popup>
                <Box sx={{ p: 1, minWidth: 200, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  <Avatar src={roommate.image} sx={{ width: 48, height: 48, mb: 1 }} />
                  <Typography variant="subtitle2" fontWeight="bold">
                    {roommate.name}, {roommate.age}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" gutterBottom>
                    {roommate.location.area}
                  </Typography>
                  <Typography variant="body2" color="primary" fontWeight="bold" sx={{ mb: 1 }}>
                    Budget: ₹{(roommate.budget.min/1000).toFixed(0)}k - {(roommate.budget.max/1000).toFixed(0)}k
                  </Typography>
                  <Button 
                    variant="contained" 
                    size="small" 
                    fullWidth 
                    onClick={() => window.location.href = `/messages/new?userId=${roommate.id}`}
                  >
                    Message
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

export default RoommatesMap;
