import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Grid,
  Avatar,
  Button,
  Box,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Stack,
} from "@mui/material";
import {
  Edit as EditIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Verified as VerifiedIcon,
  GppGood as IdIcon,
} from "@mui/icons-material";
import { loadUser } from "../../redux/slices/authSlice";
import { RootState, AppDispatch } from "../../redux/store";
import LinearProgress, { LinearProgressProps } from '@mui/material/LinearProgress';

function LinearProgressWithLabel(props: LinearProgressProps & { value: number }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <Box sx={{ width: '100%', mr: 1 }}>
        <LinearProgress variant="determinate" {...props} />
      </Box>
      <Box sx={{ minWidth: 35 }}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(
          props.value,
        )}%`}</Typography>
      </Box>
    </Box>
  );
}

// Interfaces
interface UserPreferences {
  lifestyle?: string[];
  interests?: string[];
  gender?: string;
  occupation?: string;
  ageRange?: {
    min: number;
    max: number;
  };
}

interface UserBudget {
  min: number;
  max: number;
}

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  profilePicture?: string;
  phone?: string;
  location?: string;
  bio?: string;
  age?: number;
  occupation?: string;
  university?: string;
  budget?: UserBudget;
  preferences?: UserPreferences;
  createdAt: string;
  socialProvider?: string;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isIdVerified?: boolean;
  isBoosted?: boolean;
}

const UserProfile: React.FC = () => {
  React.useEffect(() => { document.title = "My Profile | Flatmates"; }, []);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const { user, loading, error, isAuthenticated } = useSelector(
    (state: RootState) =>
      state.auth as {
        user: User | null;
        loading: boolean;
        error: string | null;
        isAuthenticated: boolean | null;
      }
  );

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (isAuthenticated && !user) {
      dispatch(loadUser());
    }
  }, [dispatch, user, isAuthenticated, navigate]);

  if (loading) {
    return (
      <Container
        maxWidth="md"
        sx={{ mt: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography color="error">Error loading profile: {error}</Typography>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>No profile data available</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
          flexWrap="wrap"
          gap={2}
        >
          <Box display="flex" alignItems="center" gap={2}>
            <Typography variant="h4" component="h1">
              My Profile
            </Typography>
            {user.isBoosted && (
              <Chip 
                label="BOOSTED" 
                color="secondary" 
                size="small" 
                sx={{ fontWeight: 'bold' }} 
              />
            )}
          </Box>
          <Stack direction="row" spacing={2}>
            {!user.isBoosted && (
              <Button
                variant="outlined"
                color="secondary"
                startIcon={<VerifiedIcon />}
                onClick={() => {
                  // Mock payment/boost flow
                  alert("Boost your profile to appear at the top of search results and get 2x more leads!");
                }}
              >
                Boost Profile
              </Button>
            )}
            <Button
              component={RouterLink}
              to="/profile/edit"
              variant="contained"
              startIcon={<EditIcon />}
            >
              Edit Profile
            </Button>
          </Stack>
        </Box>

        {/* Completeness & Verification */}
        {user && (
           <Box mb={4}>
             <Typography variant="h6" gutterBottom>Profile Completeness</Typography>
             <LinearProgressWithLabel value={
               ((user.name ? 1 : 0) + 
               (user.email ? 1 : 0) + 
               (user.phone ? 1 : 0) + 
               (user.bio ? 1 : 0) + 
               (user.avatar || user.profilePicture ? 1 : 0) + 
               (user.preferences?.lifestyle?.length ? 1 : 0)) / 6 * 100
             } />
             
             <Box mt={2} display="flex" gap={1}>
               <Chip 
                 icon={<EmailIcon />} 
                 label="Email Verified" 
                 color={user.isEmailVerified ? "success" : "default"} 
                 variant={user.isEmailVerified ? "filled" : "outlined"} 
               />
               <Chip 
                 icon={<PhoneIcon />} 
                 label="Phone Verified" 
                 color={user.isPhoneVerified ? "success" : "default"} 
                 variant={user.isPhoneVerified ? "filled" : "outlined"} 
               />
                <Chip 
                 icon={<IdIcon />} 
                 label="ID Verified" 
                 color={user.isIdVerified ? "success" : "default"} 
                 variant={user.isIdVerified ? "filled" : "outlined"} 
               />
             </Box>
           </Box>
        )}

        <Grid container spacing={4}>
          {/* Avatar Section */}
          <Grid item xs={12} md={4}>
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar
                alt={`${user.name}'s profile picture`}
                src={user.profilePicture || user.avatar}
                sx={{ width: 150, height: 150, mb: 2 }}
              >
                {user.name?.[0]}
              </Avatar>
              <Typography variant="h5" gutterBottom>
                {user.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Member since {new Date(user.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          </Grid>

          {/* Main Content Section */}
          <Grid item xs={12} md={8}>
            {/* Contact Information */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Contact Information
                </Typography>
                <Box display="flex" alignItems="center" mb={1}>
                  <EmailIcon sx={{ mr: 1, color: "text.secondary" }} />
                  <Typography>{user.email}</Typography>
                </Box>
                {user.phone && (
                  <Box display="flex" alignItems="center" mb={1}>
                    <PhoneIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography>{user.phone}</Typography>
                  </Box>
                )}
                {user.location && (
                  <Box display="flex" alignItems="center">
                    <LocationIcon sx={{ mr: 1, color: "text.secondary" }} />
                    <Typography>{user.location}</Typography>
                  </Box>
                )}
              </CardContent>
            </Card>

            {/* Bio Section */}
            {user.bio && (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    About Me
                  </Typography>
                  <Typography variant="body1">{user.bio}</Typography>
                </CardContent>
              </Card>
            )}

            {/* Personal Details */}
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Personal Details
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries({
                    Age: user.age ? `${user.age} years old` : null,
                    Occupation: user.occupation,
                    University: user.university,
                    "Budget Range": user.budget
                      ? `$${user.budget.min} - $${user.budget.max}`
                      : null,
                  }).map(
                    ([label, value]) =>
                      value && (
                        <Grid item xs={6} key={label}>
                          <Typography variant="body2" color="text.secondary">
                            {label}
                          </Typography>
                          <Typography variant="body1">{value}</Typography>
                        </Grid>
                      )
                  )}
                </Grid>
              </CardContent>
            </Card>

            {/* Preferences Section */}
            {user.preferences && (
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Preferences
                  </Typography>
                  {user.preferences.lifestyle && (
                    <Box mb={2}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Lifestyle
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {user.preferences.lifestyle.map((item, index) => (
                          <Chip key={index} label={item} size="small" />
                        ))}
                      </Box>
                    </Box>
                  )}
                  {user.preferences.interests && (
                    <Box>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        gutterBottom
                      >
                        Interests
                      </Typography>
                      <Box display="flex" flexWrap="wrap" gap={1}>
                        {user.preferences.interests.map((item, index) => (
                          <Chip
                            key={index}
                            label={item}
                            size="small"
                            color="primary"
                          />
                        ))}
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default UserProfile;
