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
import { Formik, Form, Field, FieldArray } from "formik";
import * as Yup from "yup";
import { RootState, useAppDispatch } from "../../redux/store";

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
  currency: string;
  period: string;
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

interface Property {
  _id?: string;
  title: string;
  description: string;
  propertyType: string;
  userType: string;
  price: Price;
  address: Address;
  bedrooms?: number;
  bathrooms?: number;
  size?: number;
  availableFrom?: string;
  amenities: string[];
  rules: string[];
  preferences: Preferences;
  images?: string[];
}

interface FormValues {
  title: string;
  description: string;
  propertyType: string;
  userType: string;
  price: Price;
  address: Address;
  bedrooms: string;
  bathrooms: string;
  size: string;
  availableFrom: string;
  amenities: string[];
  rules: string[];
  preferences: Preferences;
}

const PropertyForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { property, loading } = useSelector(
    (state: RootState) => state.property
  );
  const { user } = useSelector((state: RootState) => state.auth);

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [removedImages, setRemovedImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = Boolean(id);

  // Fetch property details if in edit mode
  useEffect(() => {
    if (isEditMode && id) {
      dispatch(getPropertyById(id));
    }
  }, [dispatch, id, isEditMode]);

  // Set form initial values when property data is loaded
  useEffect(() => {
    if (isEditMode && property && (property as any).images) {
      setImagePreviewUrls((property as any).images as string[]);
    }
  }, [isEditMode, property]);

  // Handle image upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    const filesList = e.target.files;
    const newImages = filesList ? Array.from(filesList) : [];
    if (newImages.length === 0) return;

    // Validate file types and sizes
    const validImages = newImages.filter((file) => {
      const isValidType = ["image/jpeg", "image/png", "image/jpg"].includes(
        file.type
      );
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max

      if (!isValidType) {
        dispatch(
          showAlert("error", "Only JPEG, JPG and PNG images are allowed")
        );
      }
      if (!isValidSize) {
        dispatch(showAlert("error", "Image size should not exceed 5MB"));
      }

      return isValidType && isValidSize;
    });

    if (validImages.length === 0) return;

    // Limit to 5 images total
    const totalImages = [...images, ...validImages];
    const totalPreviews = [...imagePreviewUrls];

    if (totalImages.length > 5) {
      dispatch(showAlert("warning", "Maximum 5 images allowed"));
      return;
    }

    setImages([...images, ...validImages]);

    // Create preview URLs
    validImages.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrls((prev) => [
          ...prev,
          (reader.result as string) || "",
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle removing images
  const handleRemoveImage = (index: number) => {
    // If in edit mode and the image is from the server
    if (isEditMode && index < ((property as any)?.images?.length || 0)) {
      const img = (property as any)?.images?.[index] as string | undefined;
      if (img) {
        setRemovedImages([...removedImages, img]);
      }
      setImagePreviewUrls(imagePreviewUrls.filter((_, i) => i !== index));
      return;
    }

    // For newly added images
    const newImageIndex = isEditMode
      ? index - (property?.images?.length || 0)
      : index;

    if (newImageIndex >= 0) {
      const newImages = [...images];
      newImages.splice(newImageIndex, 1);
      setImages(newImages);
    }

    setImagePreviewUrls(imagePreviewUrls.filter((_, i) => i !== index));
  };

  // Form validation schema
  const validationSchema = Yup.object({
    title: Yup.string()
      .required("Title is required")
      .max(100, "Title must be at most 100 characters"),
    description: Yup.string()
      .required("Description is required")
      .min(20, "Description must be at least 20 characters"),
    propertyType: Yup.string().required("Property type is required"),
    userType: Yup.string().required("User type is required"),
    "price.amount": Yup.number()
      .required("Price is required")
      .positive("Price must be positive"),
    "price.currency": Yup.string().required("Currency is required"),
    "price.period": Yup.string().required("Period is required"),
    "address.street": Yup.string().required("Street address is required"),
    "address.city": Yup.string().required("City is required"),
    "address.state": Yup.string().required("State/Province is required"),
    "address.zipCode": Yup.string().required("ZIP/Postal code is required"),
    "address.country": Yup.string().required("Country is required"),
    bedrooms: Yup.number().min(0, "Cannot be negative").nullable(),
    bathrooms: Yup.number().min(0, "Cannot be negative").nullable(),
    size: Yup.number().min(0, "Cannot be negative").nullable(),
    availableFrom: Yup.date().nullable(),
    amenities: Yup.array().of(Yup.string()),
    rules: Yup.array().of(Yup.string()),
    "preferences.gender": Yup.string().nullable(),
    "preferences.occupation": Yup.string().nullable(),
    "preferences.lifestyle": Yup.string().nullable(),
    "preferences.ageRange": Yup.string().nullable(),
  });

  // Get initial values for the form
  const getInitialValues = () => {
    if (isEditMode && property) {
      const p: any = property as any;
      return {
        title: p.title || "",
        description: p.description || "",
        propertyType: p.propertyType || "",
        userType: p.userType || "",
        price: {
          amount: (p.price && (p.price.amount ?? p.price.min ?? 0)) || 0,
          currency: (p.price && (p.price.currency || "INR")) || "INR",
          period: p.price?.period || "month",
        },
        address: {
          street: p.address?.street || "",
          city: p.address?.city || "",
          state: p.address?.state || "",
          zipCode: p.address?.zipCode || "",
          country: p.address?.country || "",
        },
        bedrooms: p.bedrooms != null ? String(p.bedrooms) : "",
        bathrooms: p.bathrooms != null ? String(p.bathrooms) : "",
        size:
          p.size != null
            ? String(p.size)
            : p.area != null
            ? String(p.area)
            : "",
        availableFrom: p.availableFrom
          ? new Date(p.availableFrom).toISOString().split("T")[0]
          : "",
        amenities: p.amenities || [],
        rules: p.rules || [],
        preferences: {
          gender: p.preferences?.gender || "",
          occupation: p.preferences?.occupation || "",
          lifestyle: p.preferences?.lifestyle || "",
          ageRange: p.preferences?.ageRange || "",
        },
      } as FormValues;
    }

    return {
      title: "",
      description: "",
      propertyType: "",
      userType: user?.userType || "",
      price: {
        amount: 0,
        currency: "INR",
        period: "month",
      },
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "",
      },
      bedrooms: "",
      bathrooms: "",
      size: "",
      availableFrom: "",
      amenities: [],
      rules: [],
      preferences: {
        gender: "",
        occupation: "",
        lifestyle: "",
        ageRange: "",
      },
    };
  };

  // Handle form submission
  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
    setIsSubmitting(true);

    try {
      const propertyData: any = {
        ...values,
        images,
        removeImages: removedImages,
      };

      let result: any;
      if (isEditMode && id) {
        result = await dispatch(updateProperty({ id, propertyData }) as any);
      } else {
        result = await dispatch(createProperty(propertyData) as any);
      }

      if (result.payload) {
        dispatch(
          showAlert(
            "success",
            isEditMode
              ? "Property updated successfully"
              : "Property created successfully"
          )
        );
        navigate(isEditMode ? `/properties/${id}` : "/properties/my-listings");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      dispatch(
        showAlert("error", `Error: ${error?.message || "Something went wrong"}`)
      );
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  };

  if (isEditMode && loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {isEditMode ? "Edit Property" : "Create New Property"}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isEditMode
            ? "Update your property listing with accurate and detailed information."
            : "Fill in the details below to create your property listing."}
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ p: 3 }}>
        <Formik
          initialValues={getInitialValues()}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            isValid,
            dirty,
          }) => (
            <Form>
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
                    error={touched.userType && Boolean(errors.userType)}
                  >
                    <InputLabel>User Type</InputLabel>
                    <Field
                      as={Select}
                      name="userType"
                      label="User Type"
                      value={values.userType}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <MenuItem value="">
                        <em>Select User Type</em>
                      </MenuItem>
                      <MenuItem value="room_seeker">Room Seeker</MenuItem>
                      <MenuItem value="roommate_seeker">
                        Roommate Seeker
                      </MenuItem>
                      <MenuItem value="room_provider">Room Provider</MenuItem>
                      <MenuItem value="property_owner">Property Owner</MenuItem>
                    </Field>
                    {touched.userType && errors.userType && (
                      <FormHelperText>{errors.userType}</FormHelperText>
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
                        <InputAdornment position="start">$</InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl
                    fullWidth
                    error={
                      touched.price?.currency && Boolean(errors.price?.currency)
                    }
                  >
                    <InputLabel>Currency</InputLabel>
                    <Field
                      as={Select}
                      name="price.currency"
                      label="Currency"
                      value={values.price.currency}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    ></Field>
                    {touched.price?.currency && errors.price?.currency && (
                      <FormHelperText>{errors.price?.currency}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl
                    fullWidth
                    error={
                      touched.price?.period && Boolean(errors.price?.period)
                    }
                  >
                    <InputLabel>Period</InputLabel>
                    <Field
                      as={Select}
                      name="price.period"
                      label="Period"
                      value={values.price.period}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    >
                      <MenuItem value="day">Per Day</MenuItem>
                      <MenuItem value="week">Per Week</MenuItem>
                      <MenuItem value="month">Per Month</MenuItem>
                      <MenuItem value="year">Per Year</MenuItem>
                    </Field>
                    {touched.price?.period && errors.price?.period && (
                      <FormHelperText>{errors.price?.period}</FormHelperText>
                    )}
                  </FormControl>
                </Grid>

                {/* Address Information */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Address Information
                  </Typography>
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
                    name="availableFrom"
                    type="date"
                    value={values.availableFrom}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={
                      touched.availableFrom && Boolean(errors.availableFrom)
                    }
                    helperText={touched.availableFrom && errors.availableFrom}
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
                    {({ push, remove }) => (
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
                            onKeyPress={(
                              e: React.KeyboardEvent<HTMLInputElement>
                            ) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const target = e.target as HTMLInputElement;
                                if (target.value.trim()) {
                                  push(target.value.trim());
                                  target.value = "";
                                }
                              }
                            }}
                          />
                          <Button
                            variant="outlined"
                            onClick={() => {
                              const input = document.querySelector(
                                'input[name="newAmenity"]'
                              );
                              if (
                                input &&
                                input instanceof HTMLInputElement &&
                                input.value.trim()
                              ) {
                                push(input.value.trim());
                                input.value = "";
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
                    {({ push, remove }) => (
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
                            onKeyPress={(
                              e: React.KeyboardEvent<HTMLInputElement>
                            ) => {
                              if (e.key === "Enter") {
                                e.preventDefault();
                                const target = e.target as HTMLInputElement;
                                if (target.value.trim()) {
                                  push(target.value.trim());
                                  target.value = "";
                                }
                              }
                            }}
                          />
                          <Button
                            variant="outlined"
                            onClick={() => {
                              const input = document.querySelector(
                                'input[name="newRule"]'
                              );
                              if (
                                input &&
                                input instanceof HTMLInputElement &&
                                input.value.trim()
                              ) {
                                push(input.value.trim());
                                input.value = "";
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
                      <MenuItem value="other">Other</MenuItem>
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
                      disabled={
                        isSubmitting || !(isValid && (dirty || isEditMode))
                      }
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
