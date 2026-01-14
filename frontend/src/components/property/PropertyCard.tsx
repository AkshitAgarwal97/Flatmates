import React, { useMemo } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Stack,
  Avatar,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  LocationOn as LocationOnIcon,
  Verified as VerifiedIcon,
  AccessTime as AccessTimeIcon,
  Restaurant as RestaurantIcon,
  SmokingRooms as SmokingRoomsIcon,
  Work as WorkIcon,
  Bed as BedIcon,
  Bathtub as BathtubIcon,
  SquareFoot as SquareFootIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Wc as WcIcon,
} from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { toggleSaveProperty } from "../../redux/slices/authSlice";
import { RootState, AppDispatch } from "../../redux/store";
import { Property } from "../../types";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

interface PropertyCardProps {
  property: Property;
  onViewDetails?: (id: string) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = React.memo(({
  property,
  onViewDetails,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Safe check for savedProperties
  const isSaved = user?.savedProperties?.includes(property._id) || false;

  const handleToggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    dispatch(toggleSaveProperty(property._id));
  };

  const handleCardClick = () => {
    if (onViewDetails) {
      onViewDetails(property._id);
    } else {
      navigate(`/properties/${property._id}`);
    }
  };

  const getImageUrl = (url: string) => {
    if (!url) return "https://picsum.photos/seed/no-image-listing/300/200";
    return url.startsWith("http")
      ? url
      : `${process.env.REACT_APP_API_URL || ""}${url}`;
  };

  const displayAddress = useMemo(() => {
    if (typeof property.address === "string") return property.address;
    if (!property.address) return "Unknown Location";
    const parts = [];
    if (property.address.street?.trim()) parts.push(property.address.street.trim());
    if (property.address.city?.trim()) parts.push(property.address.city.trim());
    if (property.address.state?.trim()) parts.push(property.address.state.trim());
    return parts.join(", ") || "Unknown Location";
  }, [property.address]);

  // Simplify occupancy/listing type for display
  const occupancyLabel = useMemo(() => {
    const type = property.listingType || property.propertyType || "";
    return type.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
  }, [property.listingType, property.propertyType]);

  const timeAgo = useMemo(() => {
     if (property.createdBy?.lastActive) {
         try {
             return formatDistanceToNow(new Date(property.createdBy.lastActive), { addSuffix: true });
         } catch (e) { return ""; }
     }
     return "";
  }, [property.createdBy?.lastActive]);

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        transition: "all 0.3s ease",
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 24px rgba(0,0,0,0.1)",
        },
        cursor: "pointer",
        position: "relative",
      }}
      onClick={handleCardClick}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="200"
          loading="lazy" // Lazy load listing images
          image={getImageUrl(property.images?.[0]?.url || "")}
          alt={`Property: ${property.title}`}
          sx={{
            objectFit: "cover",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            p: 1.5,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            background: "linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 100%)"
          }}
        >
            <Stack direction="column" spacing={0.5}>
                <Chip
                    label={occupancyLabel}
                    size="small"
                    sx={{
                    bgcolor: "rgba(255,255,255,0.95)",
                    color: "text.primary",
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    height: 24
                    }}
                />
                {property.matchScore !== undefined && (
                   <Chip
                        label={`${property.matchScore}% Match`}
                        size="small"
                        color={property.matchScore >= 80 ? "success" : property.matchScore >= 50 ? "primary" : "default"}
                        sx={{
                            height: 24,
                            fontWeight: 700,
                            fontSize: "0.7rem",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                        }}
                    />
                )}
                 {property.propertyVerified && (
                    <Chip
                    icon={<VerifiedIcon sx={{ fontSize: "14px !important" }} />}
                    label="Verified Property"
                    size="small"
                    color="success"
                    sx={{
                        height: 24,
                        fontWeight: "bold",
                        fontSize: '0.75rem'
                    }}
                    />
                )}
                 {property.isFeatured && (
                    <Chip
                    label="FEATURED"
                    size="small"
                    color="secondary"
                    sx={{
                        height: 24,
                        fontWeight: 900,
                        fontSize: '0.65rem',
                        letterSpacing: 1,
                        bgcolor: "secondary.main",
                        color: "white",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.3)"
                    }}
                    />
                )}
            </Stack>
          
          <IconButton
            size="small"
            onClick={handleToggleSave}
            sx={{
              bgcolor: "rgba(255,255,255,0.9)",
              "&:hover": { bgcolor: "white" },
            }}
          >
            {isSaved ? (
              <FavoriteIcon color="error" fontSize="small" />
            ) : (
              <FavoriteBorderIcon color="action" fontSize="small" />
            )}
          </IconButton>
        </Box>
        
        {/* Price Tag Overlay */}
        <Box 
            sx={{
                position: 'absolute',
                bottom: 10,
                left: 10,
                bgcolor: 'rgba(0,0,0,0.7)',
                color: 'white',
                px: 1.5,
                py: 0.5,
                borderRadius: 4,
                backdropFilter: 'blur(4px)'
            }}
        >
             <Typography variant="h6" fontWeight="bold" sx={{ fontSize: '1.1rem' }}>
                ₹{property.price?.amount?.toLocaleString() || 0}
            </Typography>
        </Box>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2, "&:last-child": { pb: 2 } }}>
        <Box display="flex" justifyContent="space-between" mb={1}>
             <Box sx={{ width: '100%' }}>
                 <Box display="flex" alignItems="center" mb={0.5}>
                    <LocationOnIcon color="action" sx={{ fontSize: 16, mr: 0.5, mt: 0.2 }} />
                    <Typography variant="body2" color="text.secondary" fontWeight={500} noWrap sx={{ maxWidth: '90%' }}>
                        {displayAddress}
                    </Typography>
                </Box>
                <Typography variant="subtitle1" fontWeight={700} noWrap title={property.title}>
                    {property.title}
                </Typography>
             </Box>
        </Box>

        {/* Essential Specs Row */}
        <Stack
          direction="row"
          spacing={2}
          sx={{ mb: 2, color: "text.secondary", fontSize: '0.85rem' }}
          alignItems="center"
        >
          <Box display="flex" alignItems="center" gap={0.5}>
            <BedIcon fontSize="small" />
            <Typography variant="body2" fontWeight={500}>
              {property.features?.bedrooms || property.bedrooms || 0} BHK
            </Typography>
          </Box>
           <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />
          <Box display="flex" alignItems="center" gap={0.5}>
            <SquareFootIcon fontSize="small" />
            <Typography variant="body2" fontWeight={500}>
              {property.features?.area || property.area || 0} ft²
            </Typography>
          </Box>
           <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />
           <Box display="flex" alignItems="center" gap={0.5}>
                <WcIcon fontSize="small" />
                <Typography variant="body2" fontWeight={500} sx={{ textTransform: 'capitalize' }}>
                    {property.preferences?.gender || 'Any'}
                </Typography>
           </Box>
           {(property.availableFrom || property.availabilityDate) && (
             <>
               <Divider orientation="vertical" flexItem sx={{ height: 12, my: 'auto' }} />
               <Box display="flex" alignItems="center" gap={0.5}>
                  <AccessTimeIcon fontSize="small" sx={{ fontSize: '0.9rem' }} />
                  <Typography variant="body2" fontWeight={500} sx={{ fontSize: '0.75rem' }}>
                      {new Date(property.availableFrom || property.availabilityDate || '').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </Typography>
               </Box>
             </>
           )}
        </Stack>

        <Divider sx={{ mb: 1.5 }} />

        {/* Owner Info & Trust Indicators */}
        <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={1.5}>
                 <Box position="relative">
                    <Avatar 
                        src={property.createdBy?.avatar} 
                        alt={property.createdBy?.name || "User"} 
                        sx={{ width: 32, height: 32 }}
                    />
                         <Tooltip title={property.createdBy?.isVerified ? "Verified User" : "User"}>
                             <VerifiedIcon 
                                color={property.createdBy?.isBoosted ? "secondary" : "primary"}
                                sx={{ 
                                    position: 'absolute', 
                                    bottom: -2, 
                                    right: -2, 
                                    fontSize: 14, 
                                    bgcolor: 'white', 
                                    borderRadius: '50%',
                                    display: (property.createdBy?.isVerified || property.createdBy?.isBoosted) ? 'block' : 'none'
                                }} 
                            />
                         </Tooltip>
                 </Box>
                 <Box>
                     <Typography variant="caption" fontWeight={600} display="block">
                         {property.createdBy?.name?.split(' ')[0] || "User"}
                     </Typography>
                     {timeAgo && (
                         <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                             <AccessTimeIcon sx={{ fontSize: 10 }} />
                             Active {timeAgo}
                         </Typography>
                     )}
                 </Box>
            </Box>
            
            {/* Lifestyle Icons */}
            <Stack direction="row" spacing={0.5}>
                {property.preferences?.lifestyle?.some?.((l: string) => l.toLowerCase().includes('veg')) && (
                    <Tooltip title="Vegetarian Friendly">
                        <RestaurantIcon color="success" sx={{ fontSize: 18 }} />
                    </Tooltip>
                )}
                 {property.preferences?.lifestyle?.some?.((l: string) => l.toLowerCase().includes('smok')) && (
                    <Tooltip title="Smoking Allowed">
                        <SmokingRoomsIcon color="action" sx={{ fontSize: 18 }} />
                    </Tooltip>
                )}
            </Stack>
        </Box>
        
      </CardContent>
    </Card>
  );
});

export default PropertyCard;
