import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import { useTranslation } from "react-i18next";

// MUI components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";

// MUI icons
import HouseIcon from "@mui/icons-material/House";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import ForumIcon from "@mui/icons-material/Forum";
import PeopleIcon from "@mui/icons-material/People";
import ApartmentIcon from "@mui/icons-material/Apartment";

interface AuthState {
  isAuthenticated: boolean;
}

const Home = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useSelector(
    (state: { auth: AuthState }) => state.auth
  );
  const navigate = useNavigate();
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("");
  const [searchType, setSearchType] = useState("room"); // 'room' | 'roommate'

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.append("search", location);
    if (budget) params.append("maxPrice", budget);
    if (searchType) params.append("type", searchType);
    navigate(`/properties?${params.toString()}`);
  };

  const handleTypeChange = (
    event: React.MouseEvent<HTMLElement>,
    newType: string | null
  ) => {
    if (newType !== null) {
      setSearchType(newType);
    }
  };

  return (
    <>
      {/* SEO Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: "Flatmates.co.in",
          url: "https://flatmates.co.in",
          potentialAction: {
            "@type": "SearchAction",
            target:
              "https://flatmates.co.in/properties?location={search_term_string}",
            "query-input": "required name=search_term_string",
          },
        })}
      </script>
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "Flatmates.co.in",
          url: "https://flatmates.co.in",
          logo: "https://flatmates.co.in/logo512.png",
          sameAs: [
            "https://facebook.com/flatmates.india",
            "https://twitter.com/flatmates_in",
            "https://instagram.com/flatmates.co.in",
          ],
        })}
      </script>

      {/* Hero Section */}
      <Box
        sx={{
          position: "relative",
          bgcolor: "grey.900",
          color: "#fff",
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          overflow: "hidden",
        }}
      >
        {/* Background Image with Overlay */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "url(https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80)",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.4,
            zIndex: 0,
          }}
        />

        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1, py: 8 }}>
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Typography
              variant="h2"
              component="h1"
              fontWeight="800"
              sx={{
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
                fontSize: { xs: "2.5rem", md: "4rem" },
                maxWidth: 900,
              }}
            >
              {t('home.hero_title')}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                maxWidth: 700,
                opacity: 0.9,
                fontWeight: 300,
                mb: 4,
              }}
            >
              {t('home.hero_subtitle')}
            </Typography>

            {/* Enhanced Search Box */}
            <Paper
              elevation={24}
              sx={{
                p: { xs: 2, md: 4 },
                width: "100%",
                maxWidth: 900,
                borderRadius: 4,
                bgcolor: "rgba(255, 255, 255, 0.98)",
                backdropFilter: "blur(20px)",
              }}
            >
              <Stack spacing={3}>
                <Box display="flex" justifyContent="center">
                  <ToggleButtonGroup
                    color="primary"
                    value={searchType}
                    exclusive
                    onChange={handleTypeChange}
                    aria-label="Search Type"
                    sx={{ bgcolor: "background.paper", boxShadow: 1 }}
                  >
                    <ToggleButton value="room" sx={{ px: 3, py: 1 }}>
                      <HouseIcon sx={{ mr: 1 }} /> Find a Room
                    </ToggleButton>
                    <ToggleButton value="roommate" sx={{ px: 3, py: 1 }}>
                      <PersonSearchIcon sx={{ mr: 1 }} /> Find Roommates
                    </ToggleButton>
                  </ToggleButtonGroup>
                </Box>

                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  alignItems="stretch"
                >
                  <TextField
                    fullWidth
                    placeholder="Enter City, Area or Landing Mark"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LocationOnIcon color="action" />
                        </InputAdornment>
                      ),
                    }}
                  />
                  <TextField
                    fullWidth
                    placeholder="Max Budget (₹)"
                    type="number"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Typography color="text.secondary" fontWeight="bold">
                            ₹
                          </Typography>
                        </InputAdornment>
                      ),
                    }}
                    sx={{ maxWidth: { md: 200 } }}
                  />
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleSearch}
                    sx={{
                      px: 6,
                      py: 1.5,
                      fontSize: "1.1rem",
                      fontWeight: "bold",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Search
                  </Button>
                </Stack>
              </Stack>
            </Paper>

            {/* Quick Stats */}
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={{ xs: 2, sm: 6 }}
              sx={{ pt: 2 }}
            >
              <Box display="flex" alignItems="center" gap={1}>
                <VerifiedUserIcon color="success" sx={{ fontSize: 32 }} />
                <Box textAlign="left">
                  <Typography variant="h6" fontWeight="bold" lineHeight={1}>
                    100%
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Verified Listings
                  </Typography>
                </Box>
              </Box>
              <Box display="flex" alignItems="center" gap={1}>
                <ForumIcon color="info" sx={{ fontSize: 32 }} />
                <Box textAlign="left">
                  <Typography variant="h6" fontWeight="bold" lineHeight={1}>
                    Zero
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Brokerage Fees
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Stack>
        </Container>
      </Box>

      {/* Categories Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h3"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
        >
          What are you looking for?
        </Typography>
        <Typography
          variant="h6"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 6, maxWidth: 600, mx: "auto" }}
        >
          Select your category to browse tailored listings and find exactly what
          you need.
        </Typography>

        <Grid container spacing={4}>
          {[
            {
              title: "Find a Room",
              desc: "Rent a room in a shared apartment.",
              icon: <HouseIcon sx={{ fontSize: 50, color: "white" }} />,
              color: "#1565c0",
              link: "/properties?type=room",
            },
            {
              title: "Find Roommates",
              desc: "Connect with people to hunt together.",
              icon: <PeopleIcon sx={{ fontSize: 50, color: "white" }} />,
              color: "#e91e63",
              link: "/properties?type=roommate",
            },
            {
              title: "List a Property",
              desc: "Post your property or room for fast tenant finding.",
              icon: <ApartmentIcon sx={{ fontSize: 50, color: "white" }} />,
              color: "#43a047",
              link: isAuthenticated ? "/properties/create" : "/register",
            },
          ].map((item, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card
                component={RouterLink}
                to={item.link}
                sx={{
                  textDecoration: "none",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  borderRadius: 4,
                  transition: "all 0.3s ease",
                  border: "1px solid transparent",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: 8,
                    borderColor: item.color,
                  },
                }}
              >
                <Box
                  sx={{
                    bgcolor: item.color,
                    py: 4,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  {item.icon}
                </Box>
                <CardContent sx={{ textAlign: "center", p: 4, flexGrow: 1 }}>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    fontWeight="bold"
                    color="text.primary"
                  >
                    {item.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary">
                    {item.desc}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* How it Works Section */}
      <Box sx={{ bgcolor: "grey.50", py: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            fontWeight="bold"
            textAlign="center"
            gutterBottom
          >
            How Flatmates Works
          </Typography>
          <Box sx={{ mt: 6 }}>
            <Stepper alternativeLabel activeStep={-1}>
              {[
                "Search verified listings",
                "Contact owners directly",
                "Move in hassle-free",
              ].map((label, index) => (
                <Step key={label} active>
                  <StepLabel
                    StepIconProps={{
                      sx: { fontSize: 40 },
                    }}
                  >
                    <Typography variant="h6" fontWeight="bold">
                      {label}
                    </Typography>
                  </StepLabel>
                </Step>
              ))}
            </Stepper>
          </Box>
        </Container>
      </Box>

      {/* Featured Testimonials */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Typography
          variant="h3"
          fontWeight="bold"
          textAlign="center"
          gutterBottom
        >
          Trusted by Thousands
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {[
            {
              name: "Rahul Sharma",
              role: "Techie in Bangalore",
              text: "Found a flat close to my office in 2 days. The verified badge gave me confidence.",
              avatar: "https://i.pravatar.cc/150?u=rahul",
            },
            {
              name: "Sneha Gupta",
              role: "Student in Delhi",
              text: "Met my best friend through this app! We searched for a flat together and it's been great.",
              avatar: "https://i.pravatar.cc/150?u=sneha",
            },
            {
              name: "Priya Singh",
              role: "Owner in Mumbai",
              text: "Listing my apartment was super easy. Got genuine leads and closed the deal in a week.",
              avatar: "https://i.pravatar.cc/150?u=priya",
            },
          ].map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                elevation={2}
                sx={{
                  p: 4,
                  borderRadius: 4,
                  height: "100%",
                  position: "relative",
                  "&::before": {
                    content: '"“"',
                    position: "absolute",
                    top: 20,
                    left: 20,
                    fontSize: "4rem",
                    color: "primary.main",
                    opacity: 0.2,
                    fontFamily: "serif",
                  },
                }}
              >
                <Typography
                  variant="body1"
                  color="text.secondary"
                  fontStyle="italic"
                  paragraph
                  sx={{ mb: 3, pt: 2 }}
                >
                  {testimonial.text}
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar src={testimonial.avatar} />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {testimonial.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {testimonial.role}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default Home;
