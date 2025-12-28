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
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";

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
    filters.amenities.length +
    filters.lifestyle.length +
    (filters.budgetRange[0] > 0 || filters.budgetRange[1] < 100000 ? 1 : 0);

  return (
    <Paper elevation={2} sx={{ mb: 3, borderRadius: 2 }}>
      <Box
        sx={{
          p: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterListIcon color="primary" />
          <Typography variant="h6">Advanced Filters</Typography>
          {activeFiltersCount > 0 && (
            <Chip
              label={`${activeFiltersCount} active`}
              size="small"
              color="primary"
            />
          )}
        </Box>
        {activeFiltersCount > 0 && (
          <Button
            startIcon={<ClearIcon />}
            onClick={onReset}
            size="small"
            variant="outlined"
          >
            Clear All
          </Button>
        )}
      </Box>

      <Accordion
        expanded={expanded === "filters"}
        onChange={handleChange("filters")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Basic Filters</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Property Type</InputLabel>
                <Select
                  value={filters.propertyType}
                  label="Property Type"
                  onChange={(e) => updateFilter("propertyType", e.target.value)}
                >
                  <MenuItem value="all">All Types</MenuItem>
                  <MenuItem value="apartment">Apartment</MenuItem>
                  <MenuItem value="house">House</MenuItem>
                  <MenuItem value="room">Room</MenuItem>
                  <MenuItem value="studio">Studio</MenuItem>
                  <MenuItem value="flat">Flat</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Listing Type</InputLabel>
                <Select
                  value={filters.listingType}
                  label="Listing Type"
                  onChange={(e) => updateFilter("listingType", e.target.value)}
                >
                  <MenuItem value="all">All Listings</MenuItem>
                  <MenuItem value="room_in_flat">Room in Flat</MenuItem>
                  <MenuItem value="roommates_for_flat">
                    Roommates for Flat
                  </MenuItem>
                  <MenuItem value="occupied_flat">Occupied Flat</MenuItem>
                  <MenuItem value="entire_property">Entire Property</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Bedrooms</InputLabel>
                <Select
                  value={filters.bedrooms ?? "any"}
                  label="Bedrooms"
                  onChange={(e) =>
                    updateFilter(
                      "bedrooms",
                      e.target.value === "any" ? null : Number(e.target.value)
                    )
                  }
                >
                  <MenuItem value="any">Any</MenuItem>
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4+</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Bathrooms</InputLabel>
                <Select
                  value={filters.bathrooms ?? "any"}
                  label="Bathrooms"
                  onChange={(e) =>
                    updateFilter(
                      "bathrooms",
                      e.target.value === "any" ? null : Number(e.target.value)
                    )
                  }
                >
                  <MenuItem value="any">Any</MenuItem>
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3+</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="caption"
                color="text.secondary"
                gutterBottom
                display="block"
              >
                Budget Range: ₹{filters.budgetRange[0].toLocaleString()} - ₹
                {filters.budgetRange[1].toLocaleString()}+
              </Typography>
              <Slider
                value={filters.budgetRange}
                onChange={(_, newValue) =>
                  updateFilter("budgetRange", newValue)
                }
                valueLabelDisplay="auto"
                min={0}
                max={100000}
                step={1000}
                valueLabelFormat={(value) => `₹${value.toLocaleString()}`}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded === "amenities"}
        onChange={handleChange("amenities")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            Amenities{" "}
            {filters.amenities.length > 0 && `(${filters.amenities.length})`}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
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
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded === "lifestyle"}
        onChange={handleChange("lifestyle")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>
            Lifestyle{" "}
            {filters.lifestyle.length > 0 && `(${filters.lifestyle.length})`}
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {LIFESTYLE_OPTIONS.map((lifestyle) => (
              <Chip
                key={lifestyle}
                label={lifestyle}
                onClick={() => toggleLifestyle(lifestyle)}
                color={
                  filters.lifestyle.includes(lifestyle) ? "primary" : "default"
                }
                variant={
                  filters.lifestyle.includes(lifestyle) ? "filled" : "outlined"
                }
              />
            ))}
          </Box>
        </AccordionDetails>
      </Accordion>

      <Accordion
        expanded={expanded === "preferences"}
        onChange={handleChange("preferences")}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography>Preferences</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Furnishing</InputLabel>
                <Select
                  value={filters.furnishing ?? "any"}
                  label="Furnishing"
                  onChange={(e) =>
                    updateFilter(
                      "furnishing",
                      e.target.value === "any" ? null : e.target.value
                    )
                  }
                >
                  <MenuItem value="any">Any</MenuItem>
                  <MenuItem value="furnished">Furnished</MenuItem>
                  <MenuItem value="semi-furnished">Semi-Furnished</MenuItem>
                  <MenuItem value="unfurnished">Unfurnished</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
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
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={!!filters.petFriendly}
                    onChange={(e) =>
                      updateFilter(
                        "petFriendly",
                        e.target.checked ? true : null
                      )
                    }
                  />
                }
                label="Pet Friendly"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography
                variant="caption"
                color="text.secondary"
                gutterBottom
                display="block"
              >
                Age Range: {filters.ageRange[0]} - {filters.ageRange[1]} years
              </Typography>
              <Slider
                value={filters.ageRange}
                onChange={(_, newValue) => updateFilter("ageRange", newValue)}
                valueLabelDisplay="auto"
                min={18}
                max={65}
                step={1}
              />
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </Paper>
  );
};

export default EnhancedFilters;
