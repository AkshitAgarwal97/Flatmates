import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  IconButton,
  CircularProgress,
  Alert
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Share,
  Message as MessageIcon,
  Edit,
  Delete,
  Report as ReportIcon,
  Block as BlockIcon,
  Schedule as ScheduleIcon,
  History as LastActiveIcon
} from "@mui/icons-material";
import ReportDialog from "../../components/common/ReportDialog";
import axios from "axios";
import { RootState, AppDispatch } from "../../redux/store";
import {
  getPropertyById,
  toggleSaveProperty,
  deleteProperty,
} from "../../redux/slices/propertySlice";
import { showAlert } from "../../redux/slices/alertSlice";
import NewConversation from "../messages/NewConversation";
import PropertyImageGallery from "../../components/property/PropertyImageGallery";

interface AuthState {
  user: {
    _id: string;
    name: string;
    email: string;
  } | null;
  isAuthenticated: boolean;
}

const PropertyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { property, loading, savedProperties } = useSelector(
    (state: RootState) => state.property as any
  );
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth as AuthState
  );

  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [blocking, setBlocking] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getPropertyById(id));
    }
  }, [dispatch, id]);

  // Dynamic page title — updated once property data loads
  useEffect(() => {
    if (property) {
      document.title = `${property.title} in ${property.address?.city} | Flatmates`;
    } else {
      document.title = "Property Details | Flatmates";
    }
    return () => {
      document.title = "Flatmates — Find Your Perfect Flatmate";
    };
  }, [property]);

  useEffect(() => {
    if (property && savedProperties) {
      const isPropertySaved = savedProperties.some(
        (sp: any) => sp._id === property._id
      );
      if (property.isSaved !== isPropertySaved) {
        // Saved state synced via Redux — no extra action needed
      }
    }
  }, [property, savedProperties]);

  const handleSaveProperty = async () => {
    if (!isAuthenticated) {
      dispatch(showAlert("error", "Please log in to save properties"));
      return;
    }

    if (property) {
      try {
        await dispatch(toggleSaveProperty(property._id)).unwrap();
        dispatch(
          showAlert(
            "success",
            property.isSaved
              ? "Property removed from saved"
              : "Property saved successfully"
          )
        );
      } catch (error: any) {
        dispatch(
          showAlert("error", error.message || "Failed to save property")
        );
      }
    }
  };

  const handleMessageDialogOpen = () => {
    if (!isAuthenticated) {
      dispatch(showAlert("error", "Please log in to contact the owner"));
      return;
    }
    setMessageDialogOpen(true);
  };

  const handleMessageDialogClose = () => {
    setMessageDialogOpen(false);
  };

  const handleShareDialogOpen = () => {
    setShareDialogOpen(true);
  };

  const handleShareDialogClose = () => {
    setShareDialogOpen(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    dispatch(showAlert("success", "Link copied to clipboard"));
    handleShareDialogClose();
  };

  const handleEditProperty = () => {
    if (property) {
      navigate(`/properties/edit/${property._id}`);
    }
  };

  const handleBlockUser = async () => {
    if (!isAuthenticated) {
      dispatch(showAlert("error", "Please log in to block users"));
      return;
    }

    if (
      property &&
      property.owner &&
      window.confirm(
        `Are you sure you want to block ${property.owner.name}? You will no longer see their listings or receive messages from them.`
      )
    ) {
      setBlocking(true);
      try {
        await axios.post(`/api/users/block/${property.owner._id}`);
        dispatch(showAlert("success", `${property.owner.name} has been blocked`));
        navigate("/properties");
      } catch (error: any) {
        dispatch(
          showAlert("error", error.response?.data?.msg || "Failed to block user")
        );
      } finally {
        setBlocking(false);
      }
    }
  };

  const handleReportOpen = () => {
    if (!isAuthenticated) {
      dispatch(showAlert("error", "Please log in to report listings"));
      return;
    }
    setReportDialogOpen(true);
  };

  const handleDeleteProperty = async () => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await dispatch(deleteProperty(property._id)).unwrap();
        dispatch(showAlert("success", "Property deleted successfully"));
        navigate("/properties");
      } catch (error: any) {
        dispatch(
          showAlert("error", error.message || "Failed to delete property")
        );
      }
    }
  };

  const ownerId = property?.owner?._id ?? property?.owner;
  const isOwner =
    user &&
    ownerId &&
    user._id.toString() === ownerId.toString();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!property) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6">Property not found</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto", p: 3 }}>
      {/* JSON-LD Structured Data — enables Google Rich Results for property listings */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Apartment",
            name: property.title,
            description: property.description,
            url: window.location.href,
            image: property.images?.map((img: any) => img.url) || [],
            numberOfRooms: property.features?.bedrooms,
            numberOfBathroomsTotal: property.features?.bathrooms,
            floorSize: property.features?.area
              ? {
                  "@type": "QuantitativeValue",
                  value: property.features.area,
                  unitCode: "FTK",
                }
              : undefined,
            address: {
              "@type": "PostalAddress",
              streetAddress: property.address?.street || "",
              addressLocality: property.address?.city || "",
              addressRegion: property.address?.state || "",
              postalCode: property.address?.zipCode || "",
              addressCountry: "IN",
            },
            offers: {
              "@type": "Offer",
              price: property.price?.amount,
              priceCurrency: "INR",
              availability: "https://schema.org/InStock",
              availabilityStarts: property.availability?.availableFrom,
            },
            amenityFeature: (property.features?.amenities || []).map(
              (a: string) => ({
                "@type": "LocationFeatureSpecification",
                name: a,
                value: true,
              })
            ),
            landlord: property.owner
              ? { "@type": "Person", name: property.owner.name }
              : undefined,
          }),
        }}
      />

      {/* Enhanced Image Gallery with Lightbox */}
      <Box sx={{ position: "relative", mb: 4 }}>
        <PropertyImageGallery
          images={property.images || []}
          propertyTitle={property.title}
        />
        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            gap: 1,
            zIndex: 10,
          }}
        >
          <IconButton
            onClick={handleSaveProperty}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.9)",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 1)" },
            }}
          >
            {property.isSaved ? <Favorite color="error" /> : <FavoriteBorder />}
          </IconButton>
          <IconButton
            onClick={handleShareDialogOpen}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.9)",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 1)" },
            }}
          >
            <Share />
          </IconButton>
          {isOwner && (
            <>
              <IconButton
                onClick={handleEditProperty}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 1)" },
                }}
              >
                <Edit />
              </IconButton>
              <IconButton
                onClick={handleDeleteProperty}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.9)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 1)" },
                }}
              >
                <Delete />
              </IconButton>
            </>
          )}
        </Box>
      </Box>

      {/* Property Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="h4" gutterBottom>
              {property.title}
            </Typography>
            <Typography variant="h5" color="primary" gutterBottom>
              ₹{property?.price?.amount?.toLocaleString?.() ?? "N/A"}/month
            </Typography>
          </Box>
          {property.matchScore !== undefined && (
            <Paper
              elevation={0}
              sx={{
                p: 2,
                bgcolor:
                  property.matchScore >= 80 ? "success.light" : "primary.light",
                color:
                  property.matchScore >= 80 ? "success.dark" : "primary.dark",
                borderRadius: 3,
                textAlign: "center",
                minWidth: 100,
              }}
            >
              <Typography variant="h4" fontWeight="bold">
                {property.matchScore}%
              </Typography>
              <Typography variant="caption" fontWeight="bold">
                MATCH SCORE
              </Typography>
            </Paper>
          )}
        </Box>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {property.address.street}, {property.address.city},{" "}
          {property.address.state} {property.address.zipCode}
        </Typography>
        <Box sx={{ display: "flex", gap: 3, mt: 2 }}>
          <Chip
            label={`${property.features?.bedrooms || 0} Bed${
              property.features?.bedrooms !== 1 ? "s" : ""
            }`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${property.features?.bathrooms || 0} Bath${
              property.features?.bathrooms !== 1 ? "s" : ""
            }`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${
              property.features?.area
                ? property.features.area.toLocaleString()
                : "N/A"
            } sq ft`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`Available: ${
              property.availability?.availableFrom
                ? new Date(property.availability.availableFrom).toLocaleDateString()
                : "N/A"
            }`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={
              property.propertyType
                ? property.propertyType.charAt(0).toUpperCase() +
                  property.propertyType.slice(1)
                : "N/A"
            }
            color="primary"
            variant="outlined"
          />
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Property Details */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography variant="body1" paragraph>
              {property.description}
            </Typography>

            {property.features?.amenities &&
              property.features.amenities.length > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Amenities
                  </Typography>
                  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                    {property.features.amenities.map(
                      (amenity: string, index: number) => (
                        <Chip key={index} label={amenity} variant="outlined" />
                      )
                    )}
                  </Box>
                </>
              )}

            {property.preferences &&
              Object.keys(property.preferences).length > 0 && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Typography variant="h6" gutterBottom>
                    Preferences
                  </Typography>
                  <Grid container spacing={2}>
                    {property.preferences.gender && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">
                          Gender Preference:
                        </Typography>
                        <Typography variant="body1">
                          {property.preferences.gender}
                        </Typography>
                      </Grid>
                    )}
                    {property.preferences.occupation && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">
                          Occupation Preference:
                        </Typography>
                        <Typography variant="body1">
                          {property.preferences.occupation}
                        </Typography>
                      </Grid>
                    )}
                    {property.preferences.lifestyle && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">
                          Lifestyle Preference:
                        </Typography>
                        <Typography variant="body1">
                          {property.preferences.lifestyle}
                        </Typography>
                      </Grid>
                    )}
                    {property.preferences.ageRange && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="subtitle2">
                          Age Range Preference:
                        </Typography>
                        <Typography variant="body1">
                          {property.preferences.ageRange}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}

            {property.rules && property.rules.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  House Rules
                </Typography>
                <ul>
                  {property.rules.map((rule: string, index: number) => (
                    <li key={index}>
                      <Typography variant="body1">{rule}</Typography>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </Paper>
        </Grid>

        {/* Owner Info and Contact */}
        <Grid item xs={12} md={4}>
          <Card elevation={2} sx={{ mb: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Listed by
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Avatar
                  src={property.owner.avatar}
                  alt={`Profile picture of owner ${property.owner.name}`}
                  sx={{ width: 56, height: 56, mr: 2 }}
                />
                <Box>
                  <Typography variant="subtitle1">
                    {property.owner.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    User
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Member since{" "}
                {new Date(property.owner.createdAt).toLocaleDateString()}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                  <LastActiveIcon fontSize="small" color="action" />
                  <Typography variant="body2">
                    Last Active:{" "}
                    {property.owner?.lastActive
                      ? new Date(property.owner.lastActive).toLocaleDateString()
                      : "N/A"}
                  </Typography>
                </Box>
                {property.owner?.averageResponseTime > 0 && (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <ScheduleIcon fontSize="small" color="action" />
                    <Typography variant="body2">
                      Typically responds in {property.owner.averageResponseTime} mins
                    </Typography>
                  </Box>
                )}
              </Box>
            </CardContent>
            <CardActions sx={{ flexDirection: "column", gap: 1, p: 2 }}>
              {isOwner ? (
                <Button fullWidth variant="outlined" disabled>
                  You own this property
                </Button>
              ) : (
                <>
                  {property.owner.phone ? (
                    <Alert severity="success" icon={false} sx={{ width: "100%", mb: 1 }}>
                      <Typography variant="subtitle2">
                        Phone: {property.owner.phone}
                      </Typography>
                    </Alert>
                  ) : (
                    <Button
                      fullWidth
                      variant="contained"
                      startIcon={<MessageIcon />}
                      onClick={handleMessageDialogOpen}
                    >
                      Contact Owner
                    </Button>
                  )}
                  <Box sx={{ display: "flex", gap: 1, width: "100%", mt: 1 }}>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<BlockIcon />}
                      onClick={handleBlockUser}
                      disabled={blocking}
                    >
                      Block
                    </Button>
                    <Button
                      fullWidth
                      size="small"
                      variant="outlined"
                      color="warning"
                      startIcon={<ReportIcon />}
                      onClick={handleReportOpen}
                    >
                      Report
                    </Button>
                  </Box>
                </>
              )}
            </CardActions>
          </Card>

          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Property Details
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Property ID:</Typography>
                <Typography variant="body2" color="text.secondary">
                  {property._id.substring(0, 8)}...
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Property Type:</Typography>
                <Typography variant="body2" color="text.secondary">
                  {property.propertyType
                    ? property.propertyType.charAt(0).toUpperCase() +
                      property.propertyType.slice(1)
                    : "N/A"}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Listed On:</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(property.createdAt).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Last Updated:</Typography>
                <Typography variant="body2" color="text.secondary">
                  {new Date(property.updatedAt).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="subtitle2">Views:</Typography>
                <Typography variant="body2" color="text.secondary">
                  {property.views}
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* Message Dialog */}
      <NewConversation
        open={messageDialogOpen}
        onClose={handleMessageDialogClose}
        propertyId={property._id}
        ownerId={property.owner._id}
      />

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onClose={handleShareDialogClose}>
        <DialogTitle>Share this property</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Copy the link below to share this property with others.
          </DialogContentText>
          <TextField
            margin="dense"
            fullWidth
            value={window.location.href}
            variant="outlined"
            InputProps={{ readOnly: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleShareDialogClose}>Cancel</Button>
          <Button onClick={handleCopyLink} variant="contained">
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>

      <ReportDialog
        open={reportDialogOpen}
        onClose={() => setReportDialogOpen(false)}
        targetId={property._id}
        type="property"
      />

      <Box sx={{ height: 100 }} /> {/* Spacer for bottom nav on mobile */}
    </Box>
  );
};

export default PropertyDetails;
