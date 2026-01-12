import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Slider, 
  FormControl, 
  RadioGroup, 
  FormControlLabel, 
  Radio, 
  Checkbox, 
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Drawer,
  IconButton,
  TextField,
  InputAdornment
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FilterListIcon from '@mui/icons-material/FilterList';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';

interface RoommatesFilterProps {
  filters: any;
  setFilters: (filters: any) => void;
  isMobile: boolean;
}

const RoommatesFilter: React.FC<RoommatesFilterProps> = ({ filters, setFilters, isMobile }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleBudgetChange = (event: Event, newValue: number | number[]) => {
    setFilters({ ...filters, budget: newValue as number[] });
  };

  const handleChange = (field: string, value: any) => {
    setFilters({ ...filters, [field]: value });
  };

  const FilterContent = (
    <Box sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" fontWeight={700}>Filters</Typography>
        {isMobile && (
          <IconButton onClick={() => setMobileOpen(false)}>
            <CloseIcon />
          </IconButton>
        )}
      </Box>

      {/* Location Search */}
      <Box sx={{ mb: 3 }}>
        <TextField 
          fullWidth 
          variant="outlined" 
          placeholder="Search Area..." 
          size="small"
          InputProps={{
             startAdornment: (
               <InputAdornment position="start">
                 <SearchIcon color="action" />
               </InputAdornment>
             ),
          }}
          onChange={(e) => handleChange('search', e.target.value)}
        />
      </Box>

      {/* Budget Range */}
      <Accordion defaultExpanded elevation={0} sx={{ '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
          <Typography fontWeight={600}>Budget (₹)</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0 }}>
          <Slider
            value={filters.budget}
            onChange={handleBudgetChange}
            valueLabelDisplay="auto"
            min={5000}
            max={50000}
            step={1000}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography variant="caption">₹{filters.budget[0]}</Typography>
            <Typography variant="caption">₹{filters.budget[1]}+</Typography>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Gender */}
      <Accordion defaultExpanded elevation={0} sx={{ '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
          <Typography fontWeight={600}>Gender Preference</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0 }}>
          <FormControl component="fieldset">
            <RadioGroup
              value={filters.gender}
              onChange={(e) => handleChange('gender', e.target.value)}
            >
              <FormControlLabel value="all" control={<Radio size="small" />} label="Any" />
              <FormControlLabel value="Male" control={<Radio size="small" />} label="Male" />
              <FormControlLabel value="Female" control={<Radio size="small" />} label="Female" />
            </RadioGroup>
          </FormControl>
        </AccordionDetails>
      </Accordion>

       {/* Food Preference */}
       <Accordion defaultExpanded elevation={0} sx={{ '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
          <Typography fontWeight={600}>Food</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0 }}>
          <FormControl component="fieldset">
            <RadioGroup
              value={filters.food}
              onChange={(e) => handleChange('food', e.target.value)}
            >
              <FormControlLabel value="all" control={<Radio size="small" />} label="Any" />
               <FormControlLabel value="Veg" control={<Radio size="small" />} label="Veg Only" />
              <FormControlLabel value="Non-Veg" control={<Radio size="small" />} label="Non-Veg Allowed" />
            </RadioGroup>
          </FormControl>
        </AccordionDetails>
      </Accordion>

      {/* Occupation */}
      <Accordion elevation={0} sx={{ '&:before': { display: 'none' } }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ px: 0 }}>
          <Typography fontWeight={600}>Occupation</Typography>
        </AccordionSummary>
        <AccordionDetails sx={{ px: 0 }}>
           <FormControlLabel 
             control={<Checkbox checked={filters.occupation.includes('Student')} onChange={(e) => {
               const newOcc = e.target.checked 
                ? [...filters.occupation, 'Student']
                : filters.occupation.filter((o: string) => o !== 'Student');
               handleChange('occupation', newOcc);
             }} size="small" />} 
             label="Student" 
           />
           <FormControlLabel 
             control={<Checkbox checked={filters.occupation.includes('Professional')} onChange={(e) => {
                const newOcc = e.target.checked 
                ? [...filters.occupation, 'Professional']
                : filters.occupation.filter((o: string) => o !== 'Professional');
               handleChange('occupation', newOcc);
             }} size="small" />} 
             label="Working Professional" 
           />
        </AccordionDetails>
      </Accordion>

      <Button variant="outlined" fullWidth sx={{ mt: 2 }} onClick={() => setFilters({
          budget: [5000, 50000],
          gender: 'all',
          food: 'all',
          occupation: [],
          search: ''
        })}>
        Reset Filters
      </Button>
    </Box>
  );

  if (isMobile) {
    return (
      <>
        <Button
          variant="contained"
          startIcon={<FilterListIcon />}
          onClick={() => setMobileOpen(true)}
          sx={{ 
            position: 'fixed', 
            bottom: 20, 
            left: '50%', 
            transform: 'translateX(-50%)', 
            zIndex: 1000,
            borderRadius: 20,
            boxShadow: 4,
            width: 'auto',
            minWidth: 120
          }}
        >
          Filters
        </Button>
        <Drawer
          anchor="bottom"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          PaperProps={{
            sx: { height: '80vh', borderTopLeftRadius: 16, borderTopRightRadius: 16 }
          }}
        >
          {FilterContent}
        </Drawer>
      </>
    );
  }

  return (
    <Box 
      sx={{ 
        width: 280, 
        flexShrink: 0, 
        borderRight: '1px solid', 
        borderColor: 'grey.200', 
        height: 'calc(100vh - 64px)', 
        position: 'sticky', 
        top: 64,
        display: { xs: 'none', md: 'block' },
        bgcolor: 'white'
      }}
    >
      {FilterContent}
    </Box>
  );
};

export default RoommatesFilter;
