import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, useMediaQuery, useTheme, Select, MenuItem, CircularProgress, IconButton, Tooltip } from '@mui/material';
import MapIcon from '@mui/icons-material/Map';
import ListIcon from '@mui/icons-material/List';
import RoommateCard from './RoommateCard';
import RoommatesFilter from './RoommatesFilter';
import RoommatesMap from './RoommatesMap';
import axios from 'axios';
import { Roommate } from '../../types/roommate';
import { useLocation } from 'react-router-dom';

const RoommatesList: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const routeLocation = useLocation();
  
  // Parse URL parameters
  const urlParams = new URLSearchParams(routeLocation.search);
  const maxBudgetParam = urlParams.get('maxBudget');
  const searchParam = urlParams.get('search');
  
  const [filters, setFilters] = useState({
    budget: [5000, maxBudgetParam ? Number(maxBudgetParam) : 50000],
    gender: 'all',
    food: 'all',
    occupation: [] as string[],
    search: searchParam || '',
    sortBy: 'recommended'
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
        const queryParams = new URLSearchParams();
        // Add filters to query
        if (filters.budget) {
            queryParams.append('minBudget', filters.budget[0].toString());
            queryParams.append('maxBudget', filters.budget[1].toString());
        }
        if (filters.gender !== 'all') queryParams.append('gender', filters.gender);
        if (filters.food !== 'all') queryParams.append('food', filters.food);
        if (filters.occupation.length > 0) queryParams.append('occupation', filters.occupation.join(','));
        if (filters.search) queryParams.append('search', filters.search);
        
        queryParams.append('page', page.toString());
        
        queryParams.append('sort', filters.sortBy);

        const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/roommates?${queryParams.toString()}`);
        setRoommates(res.data.roommates);
        setHasMore(res.data.page < res.data.totalPages);
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
    setSavedIds(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50' }}>
      {/* Sidebar Filters (Desktop) / Drawer Trigger (Mobile) */}
      <RoommatesFilter filters={filters} setFilters={setFilters} isMobile={isMobile} />

      <Box sx={{ flex: 1, p: { xs: 2, md: 3 } }}>
        <Container maxWidth="xl" disableGutters>

          {/* Header & Sort */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box>
                <Typography variant="h5" fontWeight={700}>
                Find Roommates
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    {roommates.length} matches found around you
                </Typography>
            </Box>
            
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Tooltip title={showMap ? "Show List" : "Show Map"}>
                    <IconButton onClick={() => setShowMap(!showMap)} sx={{ bgcolor: 'white', border: '1px solid', borderColor: 'grey.300' }}>
                        {showMap ? <ListIcon /> : <MapIcon />}
                    </IconButton>
                </Tooltip>

                <Select
                    size="small"
                    value={filters.sortBy}
                    onChange={(e) => setFilters({...filters, sortBy: e.target.value})}
                    sx={{ minWidth: 140, bgcolor: 'white' }}
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
             <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
             </Box>
          ) : showMap ? (
             <RoommatesMap roommates={roommates} />
          ) : (
             <Grid container spacing={2}>
                {roommates.map((roommate) => (
                <Grid item xs={12} sm={6} md={6} lg={4} xl={3} key={roommate.id}>
                    <RoommateCard 
                        roommate={roommate} 
                        onSave={handleSave} 
                        isSaved={savedIds.includes(roommate.id)}
                    />
                </Grid>
                ))}
            
                {roommates.length === 0 && (
                    <Grid item xs={12}>
                        <Box sx={{ textAlign: 'center', py: 8 }}>
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
