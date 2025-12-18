import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";

// MUI components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";

// MUI icons
import SearchIcon from "@mui/icons-material/Search";
import HomeIcon from "@mui/icons-material/Home";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";

interface AuthState {
  isAuthenticated: boolean;
}

const Home = () => {
  const { isAuthenticated } = useSelector(
    (state: { auth: AuthState }) => state.auth
  );
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.append("location", location);
    if (budget) params.append("maxPrice", budget);
    navigate(`/properties?${params.toString()}`);
  };

  return (
    <>
      {/* Hero Section */}
      <Paper
        sx={{
          position: "relative",
          backgroundColor: "grey.800",
          color: "#fff",
          mb: 4,
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center",
          backgroundImage:
            "url(https://picsum.photos/seed/apartment-hero/1600/900)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {/* Increase the priority of the hero background image */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            bottom: 0,
            right: 0,
            left: 0,
            backgroundColor: "rgba(0,0,0,.6)",
          }}
        />
        <Grid container>
          <Grid item md={6}>
            <Box
              sx={{
                position: "relative",
                p: { xs: 3, md: 6 },
                pr: { md: 0 },
                minHeight: 400,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
              }}
            >
              <Typography
                component="h1"
                variant="h3"
                color="inherit"
                gutterBottom
              >
                Find Your Perfect Home
              </Typography>
              <Typography variant="h5" color="inherit" paragraph>
                Connect with roommates, find rooms, or list your property with
                Flatmates.
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Button
                  component={RouterLink}
                  to="/properties"
                  variant="contained"
                  size="large"
                  startIcon={<SearchIcon />}
                  sx={{ mr: 2, mb: 2 }}
                >
                  Browse Listings
                </Button>
                {!isAuthenticated && (
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="outlined"
                    size="large"
                    sx={{ color: "white", borderColor: "white", mb: 2 }}
                  >
                    Join Now
                  </Button>
                )}
                {isAuthenticated && (
                  <Button
                    component={RouterLink}
                    to="/properties/create"
                    variant="outlined"
                    size="large"
                    sx={{ color: "white", borderColor: "white", mb: 2 }}
                  >
                    Create Listing
                  </Button>
                )}
              </Box>
              
              {/* Search Section */}
              <Paper sx={{ p: 2, mt: 2, maxWidth: 600, backgroundColor: 'rgba(255, 255, 255, 0.9)' }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={12}>
                    <Typography variant="subtitle1" color="text.primary" gutterBottom>
                      Quick Search
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <TextField
                      fullWidth
                      placeholder="Location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationOnIcon color="action" />
                          </InputAdornment>
                        ),
                      }}
                      size="small"
                      inputProps={{ 'aria-label': 'Search by location' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      placeholder="Max Budget (₹)"
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography sx={{ color: 'text.secondary', fontWeight: 'bold' }}>₹</Typography>
                          </InputAdornment>
                        ),
                      }}
                      size="small"
                      inputProps={{ 'aria-label': 'Search by maximum budget' }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={handleSearch}
                      sx={{ height: 40 }}
                      aria-label="Search Properties"
                    >
                      Search
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* User Types Section */}
      <Typography
        variant="h4"
        component="h2"
        gutterBottom
        align="center"
        sx={{ mb: 4 }}
      >
        How Flatmates Works For You
      </Typography>

      <Grid container spacing={4} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardMedia
              component="div"
              sx={{
                pt: "56.25%",
                bgcolor: "primary.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SearchIcon
                sx={{
                  fontSize: 80,
                  color: "white",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              <Typography
                component="span"
                sx={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: 0,
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  border: 0,
                }}
              >Property Seeker Icon</Typography>
            </CardMedia>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h5" component="h2">
                Property Seeker
              </Typography>
              <Typography>
                Looking for a room in an existing flat? Browse listings from
                people with rooms available.
              </Typography>
              <Button
                component={RouterLink}
                to="/properties?type=room"
                variant="text"
                sx={{ mt: 2 }}
              >
                Find Rooms
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardMedia
              component="div"
              sx={{
                pt: "56.25%",
                bgcolor: "secondary.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PeopleIcon
                sx={{
                  fontSize: 80,
                  color: "white",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              <Typography
                component="span"
                sx={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: 0,
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  border: 0,
                }}
              >Roommate Seeker Icon</Typography>
            </CardMedia>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h5" component="h2">
                Roommate Seeker
              </Typography>
              <Typography>
                Want to find roommates to search for a flat together? Connect
                with others looking to share.
              </Typography>
              <Button
                component={RouterLink}
                to="/properties?type=roommate"
                variant="text"
                sx={{ mt: 2 }}
              >
                Find Roommates
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardMedia
              component="div"
              sx={{
                pt: "56.25%",
                bgcolor: "success.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <HomeIcon
                sx={{
                  fontSize: 80,
                  color: "white",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              <Typography
                component="span"
                sx={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: 0,
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  border: 0,
                }}
              >Broker Dealer Icon</Typography>
            </CardMedia>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h5" component="h2">
                Broker/Dealer
              </Typography>
              <Typography>
                Have a room to rent in your flat? List it to find the perfect
                flatmate for your home.
              </Typography>
              {isAuthenticated ? (
                <Button
                  component={RouterLink}
                  to="/properties/create?type=broker_dealer"
                  variant="text"
                  sx={{ mt: 2 }}
                >
                  List Your Room
                </Button>
              ) : (
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="text"
                  sx={{ mt: 2 }}
                >
                  Sign In to List
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <CardMedia
              component="div"
              sx={{
                pt: "56.25%",
                bgcolor: "info.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ApartmentIcon
                sx={{
                  fontSize: 80,
                  color: "white",
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              />
              <Typography
                component="span"
                sx={{
                  position: 'absolute',
                  width: '1px',
                  height: '1px',
                  padding: 0,
                  margin: '-1px',
                  overflow: 'hidden',
                  clip: 'rect(0, 0, 0, 0)',
                  whiteSpace: 'nowrap',
                  border: 0,
                }}
              >Property Owner Icon</Typography>
            </CardMedia>
            <CardContent sx={{ flexGrow: 1 }}>
              <Typography gutterBottom variant="h5" component="h2">
                Property Owner
              </Typography>
              <Typography>
                Have a full property to rent? List it to find tenants looking
                for a new home.
              </Typography>
              {isAuthenticated ? (
                <Button
                  component={RouterLink}
                  to="/properties/create?type=property_owner"
                  variant="text"
                  sx={{ mt: 2 }}
                >
                  List Your Property
                </Button>
              ) : (
                <Button
                  component={RouterLink}
                  to="/login"
                  variant="text"
                  sx={{ mt: 2 }}
                >
                  Sign In to List
                </Button>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Features Section */}
      <Paper sx={{ p: 4, mb: 6, bgcolor: "grey.100", borderRadius: 2 }}>
        <Typography
          variant="h4"
          component="h2"
          gutterBottom
          align="center"
          sx={{ mb: 4 }}
        >
          Why Choose Flatmates?
        </Typography>

        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                Verified Users
              </Typography>
              <Typography>
                Connect with confidence through our verification system. (Social Login Coming Soon)
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                Direct Messaging
              </Typography>
              <Typography>
                Communicate directly with potential roommates or property
                owners.
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} md={4}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                Smart Matching
              </Typography>
              <Typography>
                Find the perfect match based on your preferences and
                requirements.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Call to Action */}
      <Box sx={{ textAlign: "center", mb: 6 }}>
        <Typography variant="h4" component="h2" gutterBottom>
          Ready to Find Your Perfect Match?
        </Typography>
        <Typography
          variant="body1"
          paragraph
          sx={{ maxWidth: 600, mx: "auto" }}
        >
          Whether you're looking for a room, a roommate, or tenants for your
          property, Flatmates makes the process simple and secure.
        </Typography>
        <Button
          component={RouterLink}
          to={isAuthenticated ? "/properties" : "/register"}
          variant="contained"
          size="large"
          sx={{ mt: 2 }}
        >
          {isAuthenticated ? "Browse Listings" : "Get Started"}
        </Button>
      </Box>
    </>
  );
};

export default Home;
