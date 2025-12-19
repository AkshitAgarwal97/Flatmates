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
import ChatIcon from "@mui/icons-material/Chat";
import VpnKeyIcon from "@mui/icons-material/VpnKey";
import StarIcon from "@mui/icons-material/Star";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ForumIcon from "@mui/icons-material/Forum";
import Avatar from "@mui/material/Avatar";
import Rating from "@mui/material/Rating";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";

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
      {/* SEO Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Flatmates.co.in",
          "url": "https://flatmates.co.in",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://flatmates.co.in/properties?location={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Flatmates.co.in",
          "url": "https://flatmates.co.in",
          "logo": "https://flatmates.co.in/logo512.png",
          "sameAs": [
            "https://facebook.com/flatmates.india",
            "https://twitter.com/flatmates_in",
            "https://instagram.com/flatmates.co.in"
          ]
        })}
      </script>

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
        <Container maxWidth="lg">
          <Grid container>
            <Grid item xs={12} md={7}>
              <Box
                sx={{
                  position: "relative",
                  p: { xs: 4, md: 8 },
                  minHeight: 500,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                }}
              >
                <Typography
                  component="h1"
                  variant="h2"
                  fontWeight="bold"
                  color="inherit"
                  gutterBottom
                  sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
                >
                  Find Your Perfect Home
                </Typography>
                <Typography variant="h5" color="inherit" paragraph sx={{ mb: 4, textShadow: '1px 1px 2px rgba(0,0,0,0.5)' }}>
                  India's #1 Broker-Free Platform to connect with roommates and find verified rooms.
                </Typography>
                
                {/* Enhanced Search Section */}
                <Paper 
                  elevation={10}
                  sx={{ 
                    p: 3, 
                    borderRadius: 3,
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    maxWidth: 700
                  }}
                >
                  <Typography variant="h6" color="primary" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                    Quick Property Search
                  </Typography>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={5}>
                      <TextField
                        fullWidth
                        placeholder="Search Area / City"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationOnIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{ bgcolor: 'white' }}
                        inputProps={{ 'aria-label': 'Search by location' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        fullWidth
                        placeholder="Max Budget"
                        type="number"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Typography color="primary" sx={{ fontWeight: 'bold' }}>₹</Typography>
                            </InputAdornment>
                          ),
                        }}
                        sx={{ bgcolor: 'white' }}
                        inputProps={{ 'aria-label': 'Search by maximum budget' }}
                      />
                    </Grid>
                    <Grid item xs={12} sm={3}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={handleSearch}
                        startIcon={<SearchIcon />}
                        sx={{ height: 56, fontWeight: 'bold' }}
                        aria-label="Search Properties"
                      >
                        Search
                      </Button>
                    </Grid>
                  </Grid>
                </Paper>

                <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <VerifiedUserIcon color="success" />
                     <Typography variant="subtitle2" color="inherit">100% Verified Users</Typography>
                   </Box>
                   <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                     <ForumIcon color="info" />
                     <Typography variant="subtitle2" color="inherit">Broker-Free Chat</Typography>
                   </Box>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Paper>

      {/* How It Works Section */}
      <Box sx={{ py: 8, bgcolor: 'background.paper' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            fontWeight="bold"
            gutterBottom
            align="center"
            sx={{ mb: 6 }}
          >
            How Flatmates Works
          </Typography>
          <Grid container spacing={4}>
            {[
              { 
                icon: <SearchIcon sx={{ fontSize: 40 }} />, 
                title: "1. Search", 
                desc: "Discover verified property listings tailored to your budget and preferences." 
              },
              { 
                icon: <ChatIcon sx={{ fontSize: 40 }} />, 
                title: "2. Connect", 
                desc: "Chat directly with owners and prospective flatmates without any middleman." 
              },
              { 
                icon: <VpnKeyIcon sx={{ fontSize: 40 }} />, 
                title: "3. Move In", 
                desc: "Secure your perfect spot and move into your new home with complete peace of mind." 
              }
            ].map((step, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Box 
                  sx={{ 
                    textAlign: "center", 
                    p: 3, 
                    height: '100%',
                    transition: 'transform 0.3s',
                    '&:hover': { transform: 'translateY(-10px)' }
                  }}
                >
                  <Avatar 
                    sx={{ 
                      width: 80, 
                      height: 80, 
                      bgcolor: 'primary.main', 
                      mx: 'auto', 
                      mb: 2,
                      boxShadow: 3
                    }}
                    aria-label={`Step ${index + 1}: ${step.title}`}
                  >
                    {step.icon}
                  </Avatar>
                  <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
                    {step.title}
                  </Typography>
                  <Typography color="text.secondary">
                    {step.desc}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* User Types Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography
          variant="h3"
          component="h2"
          fontWeight="bold"
          gutterBottom
          align="center"
          sx={{ mb: 6 }}
        >
          Explore Listing Types
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
              <Typography gutterBottom variant="h5" component="h3">
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
              <Typography gutterBottom variant="h5" component="h3">
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
              <Typography gutterBottom variant="h5" component="h3">
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
              <Typography gutterBottom variant="h5" component="h3">
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
    </Container>

      {/* Testimonials Section */}
      <Box sx={{ py: 8, bgcolor: 'primary.dark', color: 'white' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            fontWeight="bold"
            gutterBottom
            align="center"
            sx={{ mb: 6 }}
          >
            Trusted & Loved by Users
          </Typography>
          <Grid container spacing={4}>
            {[
              {
                name: "Rahul Sharma",
                role: "Software Engineer",
                comment: "Found an amazing 2BHK in Bangalore within 3 days! The direct connection with flatmates saved me a fortune in brokerage.",
                avatar: "https://i.pravatar.cc/150?u=rahul"
              },
              {
                name: "Priya Patel",
                role: "Marketing Manager",
                comment: "The verification process gave me peace of mind as a solo woman traveler. Truly the most secure platform I've used.",
                avatar: "https://i.pravatar.cc/150?u=priya"
              },
              {
                name: "Amit Chenoy",
                role: "Property Owner",
                comment: "Listing my property was seamless. I found responsible tenants who fit perfectly with my house rules. Highly recommended!",
                avatar: "https://i.pravatar.cc/150?u=amit"
              }
            ].map((testimonial, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  sx={{ 
                    height: "100%", 
                    bgcolor: 'rgba(255,255,255,0.1)', 
                    color: 'white',
                    backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  <CardContent sx={{ p: 4 }}>
                    <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                      <Avatar 
                        src={testimonial.avatar} 
                        alt={`${testimonial.name}'s avatar`}
                        sx={{ width: 56, height: 56, border: '2px solid white' }} 
                      />
                      <Box>
                        <Typography variant="subtitle1" fontWeight="bold">{testimonial.name}</Typography>
                        <Typography variant="body2" sx={{ opacity: 0.8 }}>{testimonial.role}</Typography>
                      </Box>
                    </Stack>
                    <Rating value={5} readOnly size="small" sx={{ mb: 2, color: 'secondary.main' }} />
                    <Typography variant="body1" fontStyle="italic">
                      "{testimonial.comment}"
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Trust & Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Paper sx={{ p: 6, bgcolor: "grey.50", borderRadius: 4, textAlign: 'center' }}>
          <Typography
            variant="h4"
            component="h2"
            fontWeight="bold"
            gutterBottom
            sx={{ mb: 4 }}
          >
            Why Choose Flatmates?
          </Typography>

          <Grid container spacing={6}>
            <Grid item xs={12} md={4}>
              <Box>
                <VerifiedUserIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                  100% Verified Users
                </Typography>
                <Typography color="text.secondary">
                  Our robust identity checks ensure you connect only with genuine individuals.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <ChatIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                  Zero Brokerage
                </Typography>
                <Typography color="text.secondary">
                  Connect directly with owners. No hidden costs or commission fees, ever.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <StarIcon sx={{ fontSize: 48, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" component="h3" fontWeight="bold" gutterBottom>
                  Smart Matching
                </Typography>
                <Typography color="text.secondary">
                  Advanced compatibility filters to help you find people who share your lifestyle.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>

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
