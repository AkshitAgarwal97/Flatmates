import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Card, Typography, Chip, Avatar, IconButton, Divider, Button } from '@mui/material';
import { Roommate } from '../../types/roommate';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SmokeFreeIcon from '@mui/icons-material/SmokeFree';
import SmokingRoomsIcon from '@mui/icons-material/SmokingRooms';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import CleaningServicesIcon from '@mui/icons-material/CleaningServices';

interface RoommateCardProps {
  roommate: Roommate;
  onSave?: (id: string) => void;
  isSaved?: boolean;
}

const RoommateCard: React.FC<RoommateCardProps> = ({ roommate, onSave, isSaved }) => {
  const {
    name,
    age,
    gender,
    image,
    activeStatus,
    budget,
    location,
    moveInDate,
    preferences,
    compatibilityScore,
    verification
  } = roommate;

  const navigate = useNavigate();

  const formatK = (num: number) => {
    return num >= 1000 ? `${(num / 1000).toFixed(0)}k` : num;
  };

  const handleSaveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onSave) onSave(roommate.id);
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'grey.200',
        transition: 'all 0.2s',
        cursor: 'pointer',
        '&:hover': {
          transform: { md: 'translateY(-4px)' },
          boxShadow: { md: '0 4px 12px rgba(0,0,0,0.08)' },
          borderColor: 'primary.main',
        },
        position: 'relative',
        overflow: 'visible', // For badges if needed
        mb: 2,
        bgcolor: 'background.paper',
      }}
    >
      {/* Top Section - Profile & Basic Info */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ position: 'relative' }}>
          <Avatar
            src={image}
            alt={name}
            sx={{ width: 64, height: 64, border: '2px solid white', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          />
          {verification.id && (
            <Box
              sx={{
                position: 'absolute',
                bottom: -2,
                right: -2,
                bgcolor: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 0.25
              }}
            >
              <VerifiedUserIcon sx={{ fontSize: 18, color: 'success.main' }} />
            </Box>
          )}
        </Box>

        <Box sx={{ flex: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontSize: '1.1rem', fontWeight: 700, lineHeight: 1.2 }}>
              {name}, {age}
            </Typography>
            {verification.phone && (
              <CheckCircleIcon sx={{ fontSize: 16, color: 'primary.main' }} />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
            {gender} • {activeStatus}
          </Typography>
        </Box>

        <IconButton 
          onClick={handleSaveClick}
          sx={{ 
            color: isSaved ? 'secondary.main' : 'text.disabled',
            '&:hover': { bgcolor: 'transparent', color: isSaved ? 'secondary.dark' : 'secondary.main' }
          }}
        >
          {isSaved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      </Box>

      <Divider sx={{ mx: 2, borderColor: 'grey.100' }} />

      {/* Primary Info - Budget and Location */}
      <Box sx={{ px: 2, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">Budget</Typography>
          <Typography variant="body2" fontWeight="600" color="primary">
            ₹{formatK(budget.min)} - {formatK(budget.max)}
          </Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography variant="caption" color="text.secondary" display="block">Location</Typography>
          <Typography variant="body2" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <LocationOnIcon sx={{ fontSize: 14 }} />
            {location.area}
          </Typography>
        </Box>
      </Box>

      <Box sx={{ px: 2, pb: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5, flex: 1 }}>
        {roommate.compatibilityScore && (
          <Chip
            label={`${roommate.compatibilityScore}% Match`}
            size="small"
            color="success"
            sx={{ height: 24 }}
          />
        )}
        {preferences.food && (
          <Chip
            icon={<RestaurantIcon sx={{ fontSize: "14px !important" }} />}
            label={preferences.food}
            size="small"
            variant="outlined"
            sx={{ height: 24 }}
          />
        )}
        {preferences.smoking !== undefined && (
          <Chip
            icon={preferences.smoking ? <SmokingRoomsIcon sx={{ fontSize: "14px !important" }} /> : <SmokeFreeIcon sx={{ fontSize: "14px !important" }} />}
            label={preferences.smoking ? 'Smoker' : 'Non-smoker'}
            size="small"
            variant="outlined"
            sx={{ height: 24 }}
          />
        )}
        {preferences.occupation && (
           <Chip
            icon={<WorkIcon sx={{ fontSize: "14px !important" }} />}
            label={preferences.occupation}
            size="small"
            variant="outlined"
            sx={{ height: 24 }}
          />
        )}
      </Box>

      {/* Action Buttons */}
      <Box sx={{ p: 2, pt: 0, display: 'flex', gap: 1 }}>
        <Button
          variant="contained"
          fullWidth
          disableElevation
          onClick={(e) => {
            e.stopPropagation();
            const token = localStorage.getItem('token');
            if (!token) {
              navigate('/login?redirect=/roommates');
              return;
            }
            navigate(`/messages?userId=${roommate.id}`);
          }}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          Message
        </Button>
        <Button
          variant="outlined"
          fullWidth
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${roommate.id}`);
          }}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          View Profile
        </Button>
      </Box>
    </Card>
  );
};

export default RoommateCard;
