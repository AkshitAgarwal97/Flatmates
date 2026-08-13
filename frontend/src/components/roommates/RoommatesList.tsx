import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  useMediaQuery,
  useTheme,
  Select,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import MapIcon from "@mui/icons-material/Map";
import ListIcon from "@mui/icons-material/List";
import RoommateCard from "./RoommateCard";
import RoommatesFilter from "./RoommatesFilter";
import RoommatesMap from "./RoommatesMap";
import { roommateAPI, extractResponseData } from "../../services/api";
import { Roommate } from "../../types/roommate";
import { useLocation } from "react-router-dom";

const mapUserToRoommate = (user: any): Roommate => {
  const dob = user.dob ? new Date(user.dob) : null;
  const age = dob ? new Date().getFullYear() - dob.getFullYear() : 25;
  const lastActive = user.lastActive ? new Date(user.lastActive) : new Date();
  const diffHours = Math.abs(new Date().getTime() - lastActive.getTime()) / 36e5;
  const activeStatus = diffHours < 24 ? 'Active today' : 'Active recently';

  return {
    id: user._id || user.id,
    name: user.name || 'Anonymous',
    age: user.age || age,
    gender: user.gender || 'Other',
    image: user.image || user.avatar || 'https://via.placeholder.com/150',
    activeStatus: user.activeStatus || activeStatus,
    budget: user.budget || {
      min: user.preferences?.budget?.min || 5000,
      max: user.preferences?.budget?.max || 50000,
    },
    location: user.location || {
      city: 'Bangalore',
      area: (user.preferences?.location && user.preferences.location.length > 0)
        ? user.preferences.location[0]
        : 'Anywhere',
    },
    preferences: user.preferences || {
      food: user.personalLifestyle?.food || 'Veg',
      smoking: !!user.personalLifestyle?.smoking,
      drinking: !!user.personalLifestyle?.drinking,
      occupation: user.occupation || 'Professional',
      cleanliness: user.personalLifestyle?.cleanliness || 'Medium',
    },
    compatibilityScore: user.compatibilityScore || user.matchScore || 80,
    verification: user.verification || {
      phone: !!user.isPhoneVerified,
      id: !!user.isIdVerified,
    },
  };
};

const RoommatesList: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const routeLocation = useLocation();

  // Parse URL parameters
  const urlParams = new URLSearchParams(routeLocation.search);
  const maxBudgetParam = urlParams.get("maxBudget");
  const searchParam = urlParams.get("search");

  const [filters, setFilters] = useState({
    budget: [5000, maxBudgetParam ? Number(maxBudgetParam) : 50000],
    gender: "all",
    food: "all",
    occupation: [] as string[],
    search: searchParam || "",
    sortBy: "recommended",
  });

  const [roommates, setRoommates] = useState<Roommate[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showMap, setShowMap] = useState(false);

  const fetchRoommates = async () => {
    setLoading(true);
    try {
      const reqFilters: any = {};
      if (filters.budget) {
        reqFilters.minBudget = filters.budget[0].toString();
        reqFilters.maxBudget = filters.budget[1].toString();
      }
      if (filters.gender !== "all") reqFilters.gender = filters.gender;
      if (filters.food !== "all") reqFilters.food = filters.food;
      if (filters.occupation.length > 0)
        reqFilters.occupation = filters.occupation.join(",");
      if (filters.search) reqFilters.search = filters.search;
      reqFilters.page = page.toString();
      reqFilters.sort = filters.sortBy;

      const res = await roommateAPI.searchRoommates(reqFilters);
      const data = extractResponseData(res as any) as any;
      const rawRoommates = data.roommates || data.users || (Array.isArray(data) ? data : []);
      const mappedRoommates = rawRoommates.map((u: any) => mapUserToRoommate(u));
      setRoommates(mappedRoommates);
      setHasMore(data.totalPages ? data.page < data.totalPages : (data.pagination ? data.pagination.page < data.pagination.pages : false));
    } catch (err) {
      console.error("Failed to fetch roommates", err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce fetch or just fetch on filter change
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1); // Reset to page 1 on filter change
      fetchRoommates();
    }, 500);
    return () => clearTimeout(timer);
  }, [filters]);

  const handleSave = (id: string) => {
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id],
    );
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "grey.50" }}>
      {/* Sidebar Filters (Desktop) / Drawer Trigger (Mobile) */}
      <RoommatesFilter
        filters={filters}
        setFilters={setFilters}
        isMobile={isMobile}
      />

      <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Container maxWidth="xl" disableGutters>
          {/* Header & Sort */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 3,
            }}
          >
            <Box>
              <Typography variant="h5" fontWeight={700}>
                Find Roommates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {roommates.length} matches found around you
              </Typography>
            </Box>

            <Box sx={{ display: "flex", gap: 2 }}>
              <Tooltip title={showMap ? "Show List" : "Show Map"}>
                <IconButton
                  onClick={() => setShowMap(!showMap)}
                  sx={{
                    bgcolor: "white",
                    border: "1px solid",
                    borderColor: "grey.300",
                  }}
                >
                  {showMap ? <ListIcon /> : <MapIcon />}
                </IconButton>
              </Tooltip>

              <Select
                size="small"
                value={filters.sortBy}
                onChange={(e) =>
                  setFilters({ ...filters, sortBy: e.target.value })
                }
                sx={{ minWidth: 140, bgcolor: "white" }}
              >
                <MenuItem value="recommended">Recommended</MenuItem>
                <MenuItem value="newest">Recently Active</MenuItem>
                <MenuItem value="budget_low">Budget: Low to High</MenuItem>
                <MenuItem value="budget_high">Budget: High to Low</MenuItem>
              </Select>
            </Box>
          </Box>

          {/* List Grid or Map */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 5 }}>
              <CircularProgress />
            </Box>
          ) : showMap ? (
            <RoommatesMap roommates={roommates} />
          ) : (
            <Grid container spacing={2}>
              {roommates.map((roommate) => (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={6}
                  lg={4}
                  xl={3}
                  key={roommate.id}
                >
                  <RoommateCard
                    roommate={roommate}
                    onSave={handleSave}
                    isSaved={savedIds.includes(roommate.id)}
                  />
                </Grid>
              ))}

              {roommates.length === 0 && (
                <Grid item xs={12}>
                  <Box sx={{ textAlign: "center", py: 8 }}>
                    <Typography variant="h6" color="text.secondary">
                      No roommates found matching your filters.
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Try adjusting your budget or location preference.
                    </Typography>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
};

export default RoommatesList;
