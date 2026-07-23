import React, { useState } from "react";
import {
  Paper,
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Checkbox,
  FormControlLabel,
  Button,
  Chip,
  Grid,
  Stack,
  Divider,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import TuneIcon from "@mui/icons-material/Tune";

export interface EnhancedFiltersState {
  budgetRange: number[];
  propertyType: string;
  listingType: string;
  bedrooms?: number;
  bathrooms?: number;
  furnishing?: string;
  amenities: string[];
  lifestyle: string[];
  petFriendly?: boolean;
  gender?: string;
  ageRange: number[];
  availableFrom?: string;
  occupation?: string;
  street?: string;
  city?: string;
  state?: string;
  search?: string;
}

interface EnhancedFiltersProps {
  filters: EnhancedFiltersState;
  onFiltersChange: (filters: EnhancedFiltersState) => void;
  onReset: () => void;
}

const AMENITIES_OPTIONS = [
  "WiFi",
  "Air Conditioning",
  "Heating",
  "Washing Machine",
  "Refrigerator",
  "Microwave",
  "TV",
  "Parking",
  "Gym",
  "Swimming Pool",
  "Security",
  "Elevator",
  "Balcony",
  "Garden",
];

const LIFESTYLE_OPTIONS = [
  "Non-smoking",
  "Vegetarian",
  "Night owl",
  "Early bird",
  "Social",
  "Quiet",
  "Pet lover",
  "Fitness enthusiast",
];

const OCCUPATION_OPTIONS = [
  "Student",
  "Working Professional",
  "Remote / WFH",
  "Any",
];

const EnhancedFilters: React.FC<EnhancedFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const [expanded, setExpanded] = useState<string | false>("filters");

  const handleChange =
    (section: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? section : false);
    };

  const updateFilter = (key: keyof EnhancedFiltersState, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const toggleAmenity = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter((a) => a !== amenity)
      : [...filters.amenities, amenity];
    updateFilter("amenities", newAmenities);
  };

  const toggleLifestyle = (lifestyle: string) => {
    const newLifestyle = filters.lifestyle.includes(lifestyle)
      ? filters.lifestyle.filter((l) => l !== lifestyle)
      : [...filters.lifestyle, lifestyle];
    updateFilter("lifestyle", newLifestyle);
  };

  const activeFiltersCount =
    (filters.propertyType !== "all" ? 1 : 0) +
    (filters.listingType !== "all" ? 1 : 0) +
    (filters.bedrooms ? 1 : 0) +
    (filters.bathrooms ? 1 : 0) +
    (filters.furnishing ? 1 : 0) +
    (filters.petFriendly !== undefined ? 1 : 0) +
    (filters.gender ? 1 : 0) +
    (filters.occupation ? 1 : 0) +
    (filters.city ? 1 : 0) +
    (filters.availableFrom ? 1 : 0) +
    filters.amenities.length +
    filters.lifestyle.length +
    (filters.budgetRange[0] > 0 || filters.budgetRange[1] < 10000000 ? 1 : 0);

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
        position: { md: "sticky" },
        top: { md: 24 },
        maxHeight: { md: "calc(100vh - 40px)" },
        overflowY: "auto",
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(0,0,0,0.1)",
          borderRadius: "4px",
        },
      }}
    >
      <Box
        sx={{
          p: 2.5,
          bgcolor: "background.paper",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          borderBottom: "1px solid",
          borderColor: "divider",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <TuneIcon color="primary" />
          <Typography variant="h6" fontWeight="bold">
            Filters
          </Typography>
          {activeFiltersCount > 0 && (
            <Chip
              label={activeFiltersCount}
              size="small"
              color="primary"
              sx={{ height: 20, fontSize: "0.75rem", fontWeight: "bold" }}
            />
          )}
        </Box>
        {activeFiltersCount > 0 && (
          <Button
            startIcon={<ClearIcon />}
            onClick={onReset}
            size="small"
            color="error"
            sx={{ textTransform: "none", fontWeight: 600 }}
          >
            Clear
          </Button>
        )}
      </Box>

      <Box sx={{ p: 1 }}>
        <Accordion
          elevation={0}
          expanded={expanded === "filters"}
          onChange={handleChange("filters")}
          disableGutters
          sx={{ "&:before": { display: "none" } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={500}>Basic Information</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2.5}>
              <FormControl fullWidth size="small">
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={filters.propertyType}
                  label="Property Type"
                  onChange={(e) => updateFilter("propertyType", e.target.value)}
                >
                  <MenuItem value="all">Any</MenuItem>
                  <MenuItem value="apartment">Apartment</MenuItem>
                  <MenuItem value="house">House</MenuItem>
                  <MenuItem value="room">Room</MenuItem>
                  <MenuItem value="studio">Studio</MenuItem>
                </Select>
              </FormControl>

              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Beds</InputLabel>
                    <Select
                      value={filters.bedrooms ?? "any"}
                      label="Beds"
                      onChange={(e) =>
                        updateFilter(
                          "bedrooms",
                          e.target.value === "any" ? null : Number(e.target.value)
                        )
                      }
                    >
                      <MenuItem value="any">Any</MenuItem>
                      <MenuItem value={1}>1+</MenuItem>
                      <MenuItem value={2}>2+</MenuItem>
                      <MenuItem value={3}>3+</MenuItem>
                      <MenuItem value={4}>4+</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Baths</InputLabel>
                    <Select
                      value={filters.bathrooms ?? "any"}
                      label="Baths"
                      onChange={(e) =>
                        updateFilter(
                          "bathrooms",
                          e.target.value === "any" ? null : Number(e.target.value)
                        )
                      }
                    >
                      <MenuItem value="any">Any</MenuItem>
                      <MenuItem value={1}>1+</MenuItem>
                      <MenuItem value={2}>2+</MenuItem>
                      <MenuItem value={3}>3+</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  gutterBottom
                  display="block"
                  fontWeight="bold"
                >
                  Budget (Per Month)
                </Typography>
                <Box px={1}>
                  <Slider
                    value={filters.budgetRange}
                    onChange={(_, newValue) =>
                      updateFilter("budgetRange", newValue)
                    }
                    valueLabelDisplay="auto"
                    min={0}
                    max={10000000}
                    step={5000}
                    valueLabelFormat={(value) => {
                      if (value >= 10000000) return '₹1Cr';
                      if (value >= 10000000) return `₹${(value / 1000000).toFixed(1)}Cr`;
                      return `₹${value / 1000}k`;
                    }}
                  />
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    mt={-1}
                  >
                    <Typography variant="caption" color="text.secondary">
                      ₹{filters.budgetRange[0].toLocaleString()}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ₹{filters.budgetRange[1].toLocaleString()}+
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Divider />

        <Accordion
          elevation={0}
          expanded={expanded === "location"}
          onChange={handleChange("location")}
          disableGutters
          sx={{ "&:before": { display: "none" } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={500}>Location</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <FormControl fullWidth size="small" variant="outlined">
                  <InputLabel shrink htmlFor="city-input">City</InputLabel>
                  <Select
                    label="City"
                    value={filters.city || ""}
                    onChange={(e) => updateFilter("city", e.target.value)}
                    displayEmpty
                    inputProps={{ id: 'city-input' }}
                  >
                    <MenuItem value="">Any</MenuItem>
                    <MenuItem value="Delhi">Delhi</MenuItem>
                    <MenuItem value="Mumbai">Mumbai</MenuItem>
                    <MenuItem value="Bangalore">Bangalore</MenuItem>
                    <MenuItem value="Gurgaon">Gurgaon</MenuItem>
                    <MenuItem value="Noida">Noida</MenuItem>
                    <MenuItem value="Pune">Pune</MenuItem>
                    <MenuItem value="Hyderabad">Hyderabad</MenuItem>
                  </Select>
              </FormControl>
               <FormControl fullWidth size="small">
                 {/* Using text field for area/street as it's free form */}
                 <InputLabel sx={{ display: 'none' }}>Area / Landmark</InputLabel>
                 {/* Replaced with standard TextField for simplicity in filter context */}
               </FormControl>
               <Box>
                    <Typography variant="caption" color="text.secondary" gutterBottom>
                        Area / Landmark
                    </Typography>
                   <input 
                      type="text" 
                      placeholder="e.g. Koramangala, Indiranagar"
                      style={{ 
                          width: '100%', 
                          padding: '8px', 
                          borderRadius: '4px', 
                          border: '1px solid rgba(0, 0, 0, 0.23)',
                          fontFamily: 'inherit',
                          fontSize: '0.9rem'
                      }}
                      value={filters.street || ""}
                      onChange={(e) => updateFilter("street", e.target.value)}
                   />
               </Box>
            </Stack>
          </AccordionDetails>
        </Accordion>

        <Divider />

        <Accordion
          elevation={0}
          expanded={expanded === "amenities"}
          onChange={handleChange("amenities")}
          disableGutters
          sx={{ "&:before": { display: "none" } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={500}>
              Amenities {filters.amenities.length > 0 && `(${filters.amenities.length})`}
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
              {AMENITIES_OPTIONS.map((amenity) => (
                <Chip
                  key={amenity}
                  label={amenity}
                  onClick={() => toggleAmenity(amenity)}
                  color={
                    filters.amenities.includes(amenity) ? "primary" : "default"
                  }
                  variant={
                    filters.amenities.includes(amenity) ? "filled" : "outlined"
                  }
                  size="small"
                  sx={{ borderRadius: 1.5 }}
                />
              ))}
            </Box>
          </AccordionDetails>
        </Accordion>
        
        <Divider />

        <Accordion
            elevation={0}
            expanded={expanded === "lifestyle"}
            onChange={handleChange("lifestyle")}
            disableGutters
            sx={{ "&:before": { display: "none" } }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={500}>
                Lifestyle {filters.lifestyle.length > 0 && `(${filters.lifestyle.length})`}
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                {LIFESTYLE_OPTIONS.map((item) => (
                  <Chip
                    key={item}
                    label={item}
                    onClick={() => toggleLifestyle(item)}
                    color={
                      filters.lifestyle.includes(item) ? "secondary" : "default"
                    }
                    variant={
                      filters.lifestyle.includes(item) ? "filled" : "outlined"
                    }
                    size="small"
                    sx={{ borderRadius: 1.5 }}
                  />
                ))}
              </Box>
            </AccordionDetails>
          </Accordion>

        <Divider />

        <Accordion
          elevation={0}
          expanded={expanded === "preferences"}
          onChange={handleChange("preferences")}
          disableGutters
          sx={{ "&:before": { display: "none" } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography fontWeight={500}>More Preferences</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Gender Preference</InputLabel>
                <Select
                  value={filters.gender ?? "any"}
                  label="Gender Preference"
                  onChange={(e) =>
                    updateFilter(
                      "gender",
                      e.target.value === "any" ? null : e.target.value
                    )
                  }
                >
                  <MenuItem value="any">Any</MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth size="small">
                <InputLabel>Occupation</InputLabel>
                <Select
                  value={filters.occupation ?? "Any"}
                  label="Occupation"
                  onChange={(e) =>
                    updateFilter(
                      "occupation",
                      e.target.value === "Any" ? null : e.target.value
                    )
                  }
                >
                  {OCCUPATION_OPTIONS.map((occ) => (
                    <MenuItem key={occ} value={occ}>
                      {occ}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

               <Box>
                <Typography variant="caption" color="text.secondary" gutterBottom>
                    Move-in Date
                </Typography>
                <input
                    type="date"
                    style={{
                        width: '100%',
                        padding: '10px',
                        borderRadius: '4px',
                        border: '1px solid rgba(0, 0, 0, 0.23)',
                        fontFamily: 'inherit'
                    }}
                    value={filters.availableFrom || ""}
                    onChange={(e) => updateFilter("availableFrom", e.target.value)}
                />
              </Box>

              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!filters.petFriendly}
                    onChange={(e) =>
                      updateFilter("petFriendly", e.target.checked ? true : null)
                    }
                  />
                }
                label="Pet Friendly"
              />
            </Stack>
          </AccordionDetails>
        </Accordion>
      </Box>
    </Paper>
  );
};

export default EnhancedFilters;
