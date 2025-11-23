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
} from "@mui/material";
import {
  Favorite,
  FavoriteBorder,
  Share,
  Message as MessageIcon,
  Edit,
  Delete,
  ArrowBack,
  ArrowForward,
} from "@mui/icons-material";
import { RootState, AppDispatch } from "../../redux/store";
import {
  getPropertyById,
  toggleSaveProperty,
} from "../../redux/slices/propertySlice";
import { showAlert } from "../../redux/slices/alertSlice";
import NewConversation from "../messages/NewConversation";

// interface Address {
//   street: string;
//   city: string;
//   state: string;
//   zipCode: string;
//   country: string;
// }

// interface Price {
//   amount: number;
//   currency: string;
// }

// // interface Owner {
// //   _id: string;
// //   name: string;
// //   avatar?: string;
// //   userType?: string;
// //   createdAt: string;
// // }

// interface Preferences {
//   gender?: string;
//   occupation?: string;
//   lifestyle?: string;
//   ageRange?: string;
// }

// interface PropertyDetail {
//   _id: string;
//   title: string;
//   description: string;
//   propertyType: string;
//   userType: string;
//   availabilityDate: string;
//   images: string[];
//   amenities: string[];
//   preferences?: Preferences;
//   rules: string[];
//   owner: Owner;
//   views: number;
//   isSaved?: boolean;
//   createdAt: string;
//   updatedAt: string;
// }
interface AuthState {
  user: {
    _id: string;
    name: string;
    email: string;
    userType: string;
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

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [messageDialogOpen, setMessageDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getPropertyById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (property && savedProperties) {
      const isPropertySaved = savedProperties.some(
        (sp: any) => sp._id === property._id
      );
      if (property.isSaved !== isPropertySaved) {
        // Update the property's saved status based on savedProperties
        // This is handled in the component state rather than modifying the Redux state directly
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

  const handleNextImage = () => {
    if (property && property.images.length > 0) {
      setCurrentImageIndex(
        (prevIndex) => (prevIndex + 1) % property.images.length
      );
    }
  };

  const handlePrevImage = () => {
    if (property && property.images.length > 0) {
      setCurrentImageIndex(
        (prevIndex) =>
          (prevIndex - 1 + property.images.length) % property.images.length
      );
    }
  };

  const handleEditProperty = () => {
    if (property) {
      navigate(`/edit-property/${property._id}`);
    }
  };

  const isOwner = user && property && user._id === property.owner._id;

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
      {/* Image Gallery */}
      <Box sx={{ position: "relative", mb: 4 }}>
        {property.images && property.images.length > 0 ? (
          <>
            <Box
              component="img"
              src={property.images[currentImageIndex]}
              alt={property.title}
              sx={{
                width: "100%",
                height: 400,
                objectFit: "cover",
                borderRadius: 2,
              }}
            />
            {property.images.length > 1 && (
              <>
                <IconButton
                  onClick={handlePrevImage}
                  sx={{
                    position: "absolute",
                    left: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(255, 255, 255, 0.8)",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
                  }}
                >
                  <ArrowBack />
                </IconButton>
                <IconButton
                  onClick={handleNextImage}
                  sx={{
                    position: "absolute",
                    right: 16,
                    top: "50%",
                    transform: "translateY(-50%)",
                    bgcolor: "rgba(255, 255, 255, 0.8)",
                    "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
                  }}
                >
                  <ArrowForward />
                </IconButton>
              </>
            )}
          </>
        ) : (
          <Box
            sx={{
              width: "100%",
              height: 400,
              bgcolor: "grey.200",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No Image Available
            </Typography>
          </Box>
        )}

        <Box
          sx={{
            position: "absolute",
            top: 16,
            right: 16,
            display: "flex",
            gap: 1,
          }}
        >
          <IconButton
            onClick={handleSaveProperty}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.8)",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
            }}
          >
            {property.isSaved ? <Favorite color="error" /> : <FavoriteBorder />}
          </IconButton>
          <IconButton
            onClick={handleShareDialogOpen}
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.8)",
              "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
            }}
          >
            <Share />
          </IconButton>
          {isOwner && (
            <>
              <IconButton
                onClick={handleEditProperty}
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.8)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
                }}
              >
                <Edit />
              </IconButton>
              <IconButton
                sx={{
                  bgcolor: "rgba(255, 255, 255, 0.8)",
                  "&:hover": { bgcolor: "rgba(255, 255, 255, 0.9)" },
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
        <Typography variant="h4" gutterBottom>
          {property.title}
        </Typography>
        <Typography variant="h5" color="primary" gutterBottom>
          ${property?.price?.amount?.toLocaleString?.() ?? "N/A"}{" "}
          {property?.price?.currency ?? ""}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          {property.address.street}, {property.address.city},{" "}
          {property.address.state} {property.address.zipCode}
        </Typography>
        <Box sx={{ display: "flex", gap: 3, mt: 2 }}>
          <Chip
            label={`${property.bedrooms} Bed${
              property.bedrooms !== 1 ? "s" : ""
            }`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${property.bathrooms} Bath${
              property.bathrooms !== 1 ? "s" : ""
            }`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={`${
              property.size ? property.size.toLocaleString() : "N/A"
            } sq ft`}
            color="primary"
            variant="outlined"
          />

          <Chip
            label={`Available: ${new Date(
              property.availabilityDate
            ).toLocaleDateString()}`}
            color="primary"
            variant="outlined"
          />
          <Chip
            label={
              property.propertyType.charAt(0).toUpperCase() +
              property.propertyType.slice(1)
            }
            color="primary"
            variant="outlined"
          />
          <Chip
            label={
              property.userType
                ? property.userType
                    .split("_")
                    .map(
                      (word: string) =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                    )
                    .join(" ")
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

            {property.amenities && property.amenities.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Amenities
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {property.amenities.map((amenity: string, index: number) => (
                    <Chip key={index} label={amenity} variant="outlined" />
                  ))}
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
                  alt={property.owner.name}
                  sx={{ width: 56, height: 56, mr: 2 }}
                />
                <Box>
                  <Typography variant="subtitle1">
                    {property.owner.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {property.owner?.userType
                      ? property.owner.userType
                          .split("_")
                          .map(
                            (word: string) =>
                              word.charAt(0).toUpperCase() + word.slice(1)
                          )
                          .join(" ")
                      : "User"}
                  </Typography>
                </Box>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Member since{" "}
                {new Date(property.owner.createdAt).toLocaleDateString()}
              </Typography>
            </CardContent>
            <CardActions>
              {!isOwner && (
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<MessageIcon />}
                  onClick={handleMessageDialogOpen}
                >
                  Contact Owner
                </Button>
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
                  {property.propertyType.charAt(0).toUpperCase() +
                    property.propertyType.slice(1)}
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
            InputProps={{
              readOnly: true,
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleShareDialogClose}>Cancel</Button>
          <Button onClick={handleCopyLink} variant="contained">
            Copy Link
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default PropertyDetails;
