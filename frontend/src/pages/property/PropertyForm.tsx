import * as React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  createProperty,
  updateProperty,
  getPropertyById,
} from "../../redux/slices/propertySlice";
import { showAlert } from "../../redux/slices/alertSlice";
import { Formik, Form, Field, FieldArray, useFormikContext } from "formik";
import * as Yup from "yup";
import { RootState, useAppDispatch } from "../../redux/store";
import axios from "axios";

// MUI components
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";

// MUI icons
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";

// Type definitions
interface Price {
  amount: number;
  brokerage?: number;
}

interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface Preferences {
  gender?: string;
  occupation?: string;
  lifestyle?: string;
  ageRange?: string;
}

interface FormValues {
  title: string;
  description: string;
  propertyType: string;
  listingType: string;
  price: Price;
  address: Address;
  bedrooms: string;
  bathrooms: string;
  size: string;
  availability: {
    availableFrom: string;
  };
  amenities: string[];
  rules: string[];
  preferences: Preferences;
}


import MyLocationIcon from "@mui/icons-material/MyLocation";

// Helper component to handle Pincode side-effects
const PincodeListener = () => {
    const { values, setFieldValue } = useFormikContext<FormValues>();
    
    useEffect(() => {
        if (values.address.zipCode && values.address.zipCode.length === 6) {
            const fetchPin = async () => {
                try {
                    // Use a clean axios instance to avoid sending auth headers
                    const cleanAxios = axios.create();
                    const response = await cleanAxios.get(`https://api.postalpincode.in/pincode/${values.address.zipCode}`);
                    
                    if (response.data && response.data[0].Status === "Success") {
                        const details = response.data[0].PostOffice[0];
                        setFieldValue("address.city", details.District);
                        setFieldValue("address.state", details.State);
                        setFieldValue("address.country", "India");
                    } else {
                        console.warn("Pincode API returned unsuccessful status");
                    }
                } catch (e) {
                    console.error("Pincode API failed:", e);
                }
            };
            fetchPin();
        }
    }, [values.address.zipCode, setFieldValue]);

    return null;
};

const PropertyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { property, loading } = useSelector(
    (state: RootState) => state.property
  );

  const [isLocating, setIsLocating] = useState(false);

  const handleUseCurrentLocation = (setFieldValue: any) => {
    if (!navigator.geolocation) {
      dispatch(showAlert("error", "Geolocation is not supported by your browser"));
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use OpenStreetMap Nominatim for reverse geocoding
          // Must use a clean axios instance to avoid auth headers
          const cleanAxios = axios.create();
          const response = await cleanAxios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );

          if (response.data && response.data.address) {
            const addr = response.data.address;
            
            // Map OSM address fields to our form fields
            const street = addr.road || addr.pedestrian || addr.suburb || "";
            const city = addr.city || addr.town || addr.village || addr.county || "";
            const state = addr.state || "";
            const zipCode = addr.postcode || "";
            const country = addr.country || "India";

            setFieldValue("address.street", street);
            setFieldValue("address.city", city);
            setFieldValue("address.state", state);
            setFieldValue("address.zipCode", zipCode);
            setFieldValue("address.country", country);
            
            // Also save coordinates if your backend supports it (it does now!)
            // We might need to add hidden fields or just rely on backend geocoding if address is accurate.
            // But since we just added 'coordinates' support to backend, let's see if we can pass it even if not in form?
            // The form values don't have 'coordinates' explicitly in IAddress for the form *input*, 
            // but the backend accepts it. 
            // For now, let's just fill the text fields which is what the user asked for.
            
            dispatch(showAlert("success", "Location detected successfully"));
          }
        } catch (error) {
          console.error("Geocoding failed:", error);
          dispatch(showAlert("error", "Failed to fetch address details"));
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        let msg = "Failed to get location";
        if (error.code === 1) msg = "Location permission denied";
        else if (error.code === 2) msg = "Location unavailable";
        else if (error.code === 3) msg = "Location request timed out";
        dispatch(showAlert("error", msg));
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // ... inside Formik render ...

  return (
    <>
      <Box sx={{ mb: 4 }}>
        {/* ... existing header code ... */}
      </Box>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Formik
          // ... existing props ...
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isValid,
            dirty,
            setFieldValue,
          }) => (
            <Form>
              <PincodeListener />
              <Grid container spacing={3}>
                {/* Basic Information */}
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Basic Information
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Title"
                    name="title"
                    value={values.title}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.title && Boolean(errors.title)}
                    helperText={touched.title && errors.title}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Description"
                    name="description"
                    multiline
                    rows={4}
                    value={values.description}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.description && Boolean(errors.description)}
                    helperText={touched.description && errors.description}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    error={touched.propertyType && Boolean(errors.propertyType)}
                  >
                    <InputLabel>Property Type</InputLabel>
                    <Field
                      as={Select}
                      name="propertyType"
                      label="Property Type"
                      value={values.propertyType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <MenuItem value="apartment">Apartment</MenuItem>
                      <MenuItem value="house">House</MenuItem>
                      <MenuItem value="condo">Condo</MenuItem>
                      <MenuItem value="studio">Studio</MenuItem>
                      <MenuItem value="room">Room</MenuItem>
                    </Field>
                    {touched.propertyType && errors.propertyType && (
                      <FormHelperText>{errors.propertyType}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl
                    fullWidth
                    error={touched.listingType && Boolean(errors.listingType)}
                  >
                    <InputLabel>Listing Type</InputLabel>
                    <Field
                      as={Select}
                      name="listingType"
                      label="Listing Type"
                      value={values.listingType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <MenuItem value="entire_property">Entire Property</MenuItem>
                      <MenuItem value="room_in_flat">Room in Flat</MenuItem>
                      <MenuItem value="roommates_for_flat">Roommates for Flat</MenuItem>
                      <MenuItem value="occupied_flat">Occupied Flat</MenuItem>
                    </Field>
                    {touched.listingType && errors.listingType && (
                      <FormHelperText>{errors.listingType}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>


                {/* Price Information */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Price Information
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Price Amount"
                    name="price.amount"
                    type="number"
                    value={values.price.amount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.price?.amount && Boolean(errors.price?.amount)
                    }
                    helperText={touched.price?.amount && errors.price?.amount}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                    }}
                    onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
                      if (e.target.value === '0') {
                        setFieldValue("price.amount", "");
                      }
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Brokerage (if any)"
                    name="price.brokerage"
                    type="number"
                    value={values.price.brokerage}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.price?.brokerage &&
                      Boolean(errors.price?.brokerage)
                    }
                    helperText={
                      touched.price?.brokerage && errors.price?.brokerage
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">₹</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                {/* Address Information */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Address Information
                    </Typography>
                    <Button
                      variant="outlined"
                      startIcon={isLocating ? <CircularProgress size={20} /> : <MyLocationIcon />}
                      onClick={() => handleUseCurrentLocation(setFieldValue)}
                      disabled={isLocating}
                      size="small"
                    >
                      {isLocating ? "Locating..." : "Use Current Location"}
                    </Button>
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Street Address"
                    name="address.street"
                    value={values.address.street}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.address?.street && Boolean(errors.address?.street)
                    }
                    helperText={
                      touched.address?.street && errors.address?.street
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="City"
                    name="address.city"
                    value={values.address.city}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.address?.city && Boolean(errors.address?.city)
                    }
                    helperText={touched.address?.city && errors.address?.city}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="State/Province"
                    name="address.state"
                    value={values.address.state}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.address?.state && Boolean(errors.address?.state)
                    }
                    helperText={touched.address?.state && errors.address?.state}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="ZIP/Postal Code"
                    name="address.zipCode"
                    value={values.address.zipCode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.address?.zipCode &&
                      Boolean(errors.address?.zipCode)
                    }
                    helperText={
                      touched.address?.zipCode && errors.address?.zipCode
                    }
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Country"
                    name="address.country"
                    value={values.address.country}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.address?.country &&
                      Boolean(errors.address?.country)
                    }
                    helperText={
                      touched.address?.country && errors.address?.country
                    }
                  />
                </Grid>

                {/* Property Details */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Property Details
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Bedrooms"
                    name="bedrooms"
                    type="number"
                    value={values.bedrooms}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.bedrooms && Boolean(errors.bedrooms)}
                    helperText={touched.bedrooms && errors.bedrooms}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Bathrooms"
                    name="bathrooms"
                    type="number"
                    value={values.bathrooms}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.bathrooms && Boolean(errors.bathrooms)}
                    helperText={touched.bathrooms && errors.bathrooms}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Size (sq ft)"
                    name="size"
                    type="number"
                    value={values.size}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.size && Boolean(errors.size)}
                    helperText={touched.size && errors.size}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Available From"
                    name="availability.availableFrom"
                    type="date"
                    value={values.availability.availableFrom}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.availability?.availableFrom && Boolean(errors.availability?.availableFrom)
                    }
                    helperText={touched.availability?.availableFrom && errors.availability?.availableFrom}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>

                {/* Amenities */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Amenities
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <FieldArray name="amenities">
                    {({ push, remove, form }) => (
                      <>
                        <Box
                          sx={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 1,
                            mb: 2,
                          }}
                        >
                          {values.amenities.map((amenity, index) => (
                            <Chip
                              key={index}
                              label={amenity}
                              onDelete={() => remove(index)}
                              color="primary"
                              variant="outlined"
                            />
                          ))}
                        </Box>

                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Field
                            as={TextField}
                            name="newAmenity"
                            label="Add Amenity"
                            placeholder="e.g. WiFi, Parking, Gym"
                            fullWidth
                            value={(form.values as any).newAmenity || ""}
                            onChange={(e: any) =>
                              form.setFieldValue("newAmenity", e.target.value)
                            }
                            onKeyPress={(
                              e: React.KeyboardEvent<HTMLInputElement>
                            ) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const target = e.target as HTMLInputElement;
                                if (target.value.trim()) {
                                  push(target.value.trim());
                                  form.setFieldValue("newAmenity", "");
                                }
                              }
                            }}
                          />
                          <Button
                            variant="outlined"
                            onClick={() => {
                              const val = (form.values as any).newAmenity || "";
                              if (val.trim()) {
                                push(val.trim());
                                form.setFieldValue("newAmenity", "");
                              }
                            }}
                          >
                            Add
                          </Button>
                        </Box>
                      </>
                    )}
                  </FieldArray>
                </Grid>

                {/* House Rules */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    House Rules
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <FieldArray name="rules">
                    {({ push, remove, form }) => (
                      <>
                        <Box sx={{ mb: 2 }}>
                          {values.rules.map((rule, index) => (
                            <Box
                              key={index}
                              sx={{
                                display: "flex",
                                alignItems: "center",
                                mb: 1,
                              }}
                            >
                              <Typography variant="body1" sx={{ flexGrow: 1 }}>
                                {index + 1}. {rule}
                              </Typography>
                              <IconButton
                                size="small"
                                onClick={() => remove(index)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Box>
                          ))}
                        </Box>

                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Field
                            as={TextField}
                            name="newRule"
                            label="Add House Rule"
                            placeholder="e.g. No smoking, No pets"
                            fullWidth
                            value={(form.values as any).newRule || ""}
                            onChange={(e: any) =>
                              form.setFieldValue("newRule", e.target.value)
                            }
                            onKeyPress={(
                              e: React.KeyboardEvent<HTMLInputElement>
                            ) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const target = e.target as HTMLInputElement;
                                if (target.value.trim()) {
                                  push(target.value.trim());
                                  form.setFieldValue("newRule", "");
                                }
                              }
                            }}
                          />
                          <Button
                            variant="outlined"
                            onClick={() => {
                              const val = (form.values as any).newRule || "";
                              if (val.trim()) {
                                push(val.trim());
                                form.setFieldValue("newRule", "");
                              }
                            }}
                          >
                            Add
                          </Button>
                        </Box>
                      </>
                    )}
                  </FieldArray>
                </Grid>

                {/* Preferences */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Preferences (Optional)
                  </Typography>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Gender Preference</InputLabel>
                    <Field
                      as={Select}
                      name="preferences.gender"
                      label="Gender Preference"
                      value={values.preferences.gender}
                      onChange={handleChange}
                    >
                      <MenuItem value="">No Preference</MenuItem>
                      <MenuItem value="male">Male</MenuItem>
                      <MenuItem value="female">Female</MenuItem>
                    </Field>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Occupation Preference</InputLabel>
                    <Field
                      as={Select}
                      name="preferences.occupation"
                      label="Occupation Preference"
                      value={values.preferences.occupation}
                      onChange={handleChange}
                    >
                      <MenuItem value="">No Preference</MenuItem>
                      <MenuItem value="student">Student</MenuItem>
                      <MenuItem value="professional">Professional</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Field>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Lifestyle Preference</InputLabel>
                    <Field
                      as={Select}
                      name="preferences.lifestyle"
                      label="Lifestyle Preference"
                      value={values.preferences.lifestyle}
                      onChange={handleChange}
                    >
                      <MenuItem value="">No Preference</MenuItem>
                      <MenuItem value="quiet">Quiet</MenuItem>
                      <MenuItem value="social">Social</MenuItem>
                      <MenuItem value="family">Family-oriented</MenuItem>
                    </Field>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    fullWidth
                    label="Age Range Preference"
                    name="preferences.ageRange"
                    placeholder="e.g. 20-30"
                    value={values.preferences.ageRange}
                    onChange={handleChange}
                  />
                </Grid>

                {/* Images */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Images
                  </Typography>
                </Grid>

                <Grid item xs={12}>
                  <Box sx={{ mb: 2 }}>
                    <Button
                      variant="outlined"
                      component="label"
                      startIcon={<CloudUploadIcon />}
                      disabled={imagePreviewUrls.length >= 5}
                    >
                      Upload Images
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                      />
                    </Button>
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{ mt: 1 }}
                    >
                      Max 5 images. Supported formats: JPEG, JPG, PNG. Max size:
                      5MB per image.
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    {imagePreviewUrls.map((url, index) => (
                      <Grid item xs={6} sm={4} md={3} key={index}>
                        <Card>
                          <CardMedia
                            component="img"
                            height="140"
                            image={url}
                            alt={`Property image ${index + 1}`}
                          />
                          <CardActions>
                            <Button
                              size="small"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleRemoveImage(index)}
                            >
                              Remove
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>

                {/* Submit Button */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mt: 2,
                    }}
                  >
                    <Button variant="outlined" onClick={() => navigate(-1)}>
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isSubmitting || !isValid}
                      startIcon={
                        isSubmitting ? (
                          <CircularProgress size={20} />
                        ) : (
                          <AddIcon />
                        )
                      }
                    >
                      {isSubmitting
                        ? "Submitting..."
                        : isEditMode
                        ? "Update Property"
                        : "Create Property"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </>
  );
};

export default PropertyForm;
