import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  Grid,
  Avatar,
  Box,
  Chip,
  Card,
  CardContent,
  CircularProgress,
  Button,
} from "@mui/material";
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Message as MessageIcon,
  School as SchoolIcon,
  Work as WorkIcon,
} from "@mui/icons-material";
import { userAPI, extractResponseData } from "../../services/api";

const PublicProfile: React.FC = () => {
  React.useEffect(() => {
    document.title = "User Profile | Flatmates";
  }, []);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      console.log(`[PublicProfile] Attempting to fetch user with ID: ${id}`);
      try {
        setLoading(true);
        const res = await userAPI.getUserById(id!);
        const data = extractResponseData(res as any) as any;
        console.log("[PublicProfile] Fetch successful:", data);
        setUser(data);
        setError(null);
      } catch (err: any) {
        console.error(
          `[PublicProfile] Fetch FAILED for ID ${id}:`,
          err.response?.status,
          err.response?.data || err.message,
        );
        setError("User not found or error loading profile.");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchUser();
  }, [id]);

  if (loading) {
    return (
      <Container
        maxWidth="md"
        sx={{ mt: 8, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  if (error || !user) {
    return (
      <Container maxWidth="md" sx={{ mt: 8 }}>
        <Typography color="error" variant="h6">
          {error}
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Grid container spacing={4}>
          <Grid
            item
            xs={12}
            md={4}
            display="flex"
            flexDirection="column"
            alignItems="center"
          >
            <Avatar
              src={user.profilePicture || user.avatar}
              sx={{
                width: 150,
                height: 150,
                mb: 2,
                border: "4px solid white",
                boxShadow: 3,
              }}
            />
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Member since {new Date(user.createdAt).toLocaleDateString()}
            </Typography>

            <Button
              variant="contained"
              fullWidth
              startIcon={<MessageIcon />}
              sx={{ mt: 3 }}
              onClick={() => navigate(`/messages?userId=${user._id}`)}
            >
              Send Message
            </Button>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box mb={3}>
              <Typography variant="h6" gutterBottom>
                About
              </Typography>
              <Typography
                variant="body1"
                color="text.primary"
                sx={{ whiteSpace: "pre-line" }}
              >
                {user.bio || "No bio added yet."}
              </Typography>
            </Box>

            <Grid container spacing={2} mb={3}>
              {user.occupation && (
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <WorkIcon color="action" />
                    <Typography>{user.occupation}</Typography>
                  </Box>
                </Grid>
              )}
              {user.university && (
                <Grid item xs={6}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <SchoolIcon color="action" />
                    <Typography>{user.university}</Typography>
                  </Box>
                </Grid>
              )}
              {user.age && (
                <Grid item xs={6}>
                  <Typography>
                    <strong>Age:</strong> {user.age}
                  </Typography>
                </Grid>
              )}
            </Grid>

            {user.preferences && (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Lifestyle & Preferences
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {user.preferences.lifestyle?.map((tag: string) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                  {user.preferences.interests?.map((tag: string) => (
                    <Chip
                      key={tag}
                      label={tag}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </Box>
            )}

            {user.location && (
              <Box mt={3} display="flex" alignItems="center">
                <LocationIcon color="action" sx={{ mr: 1 }} />
                <Typography>{user.location}</Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default PublicProfile;
