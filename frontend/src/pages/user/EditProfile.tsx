import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Formik, Form, Field, FormikHelpers } from "formik";
import * as Yup from "yup";
import { SelectChangeEvent } from "@mui/material/Select";
import {
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  Avatar,
  IconButton,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { updateProfile, loadUser } from "../../redux/slices/authSlice";
import { RootState, AppDispatch } from "../../redux/store";

// Updated interfaces with proper types
interface UserPreferences {
  lifestyle?: string[];
  interests?: string[];
  gender?: string;
  occupation?: string;
  ageRange?: {
    min: number;
    max: number;
  };
}

interface UserBudget {
  min: number;
  max: number;
}

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  phone?: string;
  location?: string;
  bio?: string;
  age?: number;
  occupation?: string;
  university?: string;
  budget?: UserBudget;
  preferences?: UserPreferences;
  createdAt: string;
  userType?: "room_seeker" | "property_owner";
  socialProvider?: string;
}

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  age: string;
  occupation: string;
  university: string;
  budgetMin: string;
  budgetMax: string;
}

// Updated validation schema with proper type handling
const validationSchema = Yup.object().shape({
  firstName: Yup.string().required("First name is required"),
  lastName: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().nullable(),
  location: Yup.string().nullable(),
  bio: Yup.string().max(500, "Bio must be less than 500 characters").nullable(),
  age: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(18, "Must be at least 18")
    .max(100, "Invalid age")
    .nullable(),
  occupation: Yup.string().nullable(),
  university: Yup.string().nullable(),
  budgetMin: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0, "Budget must be positive")
    .nullable(),
  budgetMax: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0, "Budget must be positive")
    .test(
      "max",
      "Max budget must be greater than min budget",
      function (value) {
        const { budgetMin } = this.parent;
        if (!budgetMin || !value) return true;
        return value > budgetMin;
      }
    )
    .nullable(),
});

const lifestyleOptions = [
  "Non-smoker",
  "Smoker",
  "Social drinker",
  "Non-drinker",
  "Pet-friendly",
  "No pets",
  "Early riser",
  "Night owl",
  "Quiet",
  "Social",
  "Clean",
  "Organized",
];

const interestOptions = [
  "Sports",
  "Music",
  "Movies",
  "Reading",
  "Cooking",
  "Travel",
  "Gaming",
  "Art",
  "Photography",
  "Fitness",
  "Technology",
  "Nature",
  "Fashion",
  "Food",
];

const EditProfile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading, error, isAuthenticated } = useSelector(
    (state: RootState) =>
      state.auth as {
        user: User | null;
        loading: boolean;
        error: string | null;
        isAuthenticated: boolean | null;
      }
  );
  const [selectedLifestyle, setSelectedLifestyle] = useState<string[]>([]);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [profileImage, setProfileImage] = useState<File | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (isAuthenticated && !user) {
      dispatch(loadUser());
    }
  }, [dispatch, user, isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setSelectedLifestyle(user.preferences?.lifestyle || []);
      setSelectedInterests(user.preferences?.interests || []);
    }
  }, [user]);
  // First, update the CompleteProfileFormValues interface
  interface CompleteProfileFormValues {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    location?: string;
    bio?: string;
    age?: string;
    occupation?: string;
    university?: string;
    preferences?: {
      location: string;
      budget: string;
      moveInDate: string;
      duration: string;
      gender: string;
      lifestyle?: string[];
      interests?: string[];
    };
    budget?: {
      min: number;
      max: number;
    };
  }

  // Then update the handleSubmit function
  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    try {
      const formData: Partial<CompleteProfileFormValues> = {
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        location: values.location,
        bio: values.bio,
        age: values.age,
        occupation: values.occupation,
        university: values.university,
        preferences: {
          location: values.location || "", // Provide default values
          budget: values.budgetMax?.toString() || "",
          moveInDate: new Date().toISOString(), // Default to current date
          duration: "12", // Default duration
          gender: "any", // Default gender preference
          lifestyle: selectedLifestyle,
          interests: selectedInterests,
        },
      };

      if (values.budgetMin && values.budgetMax) {
        formData.budget = {
          min: Number(values.budgetMin),
          max: Number(values.budgetMax),
        };
      }

      // Create updateData with proper typing
      const updateData = {
        ...formData,
        avatar: profileImage || undefined, // Use undefined instead of null
      } as const;

      await dispatch(updateProfile(updateData)).unwrap();
      navigate("/profile");
    } catch (error) {
      console.error(
        "Profile update failed:",
        error instanceof Error ? error.message : "Unknown error"
      );
    } finally {
      setSubmitting(false);
    }
  };
  // Updated image change handler with proper type checking
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setProfileImage(file);
    } else {
      console.error("Invalid file type");
    }
  };

  // Updated Select component handlers with proper typing
  const handleLifestyleChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedLifestyle(event.target.value as string[]);
  };

  const handleInterestsChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedInterests(event.target.value as string[]);
  };

  // Add proper typing for the initial values
  const getInitialValues = (user: User | null): FormValues => ({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    location: user?.location || "",
    bio: user?.bio || "",
    age: user?.age?.toString() || "",
    occupation: user?.occupation || "",
    university: user?.university || "",
    budgetMin: user?.budget?.min?.toString() || "",
    budgetMax: user?.budget?.max?.toString() || "",
  });

  const profileData: Partial<User> = user || {};

  const initialValues: FormValues = {
    firstName: profileData.firstName || "",
    lastName: profileData.lastName || "",
    email: profileData.email || "",
    phone: profileData.phone || "",
    location: profileData.location || "",
    bio: profileData.bio || "",
    age: profileData.age?.toString() || "",
    occupation: profileData.occupation || "",
    university: profileData.university || "",
    budgetMin: profileData.budget?.min?.toString() || "",
    budgetMax: profileData.budget?.max?.toString() || "",
  };

  if (loading) {
    return (
      <Container
        maxWidth="md"
        sx={{ mt: 4, display: "flex", justifyContent: "center" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({
            errors,
            touched,
            values,
            handleChange,
            handleBlur,
            isSubmitting,
          }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid
                  item
                  xs={12}
                  display="flex"
                  justifyContent="center"
                  mb={3}
                >
                  <Box position="relative">
                    <Avatar
                      src={
                        profileImage
                          ? URL.createObjectURL(profileImage)
                          : profileData.profilePicture
                      }
                      sx={{ width: 120, height: 120 }}
                    >
                      {profileData.firstName?.[0]}
                      {profileData.lastName?.[0]}
                    </Avatar>
                    <IconButton
                      component="label"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        right: 0,
                        backgroundColor: "primary.main",
                        color: "white",
                        "&:hover": { backgroundColor: "primary.dark" },
                      }}
                    >
                      <PhotoCameraIcon />
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </IconButton>
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="firstName"
                    label="First Name"
                    fullWidth
                    error={touched.firstName && !!errors.firstName}
                    helperText={touched.firstName && errors.firstName}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="lastName"
                    label="Last Name"
                    fullWidth
                    error={touched.lastName && !!errors.lastName}
                    helperText={touched.lastName && errors.lastName}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="email"
                    label="Email"
                    type="email"
                    fullWidth
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="phone"
                    label="Phone Number"
                    fullWidth
                    error={touched.phone && !!errors.phone}
                    helperText={touched.phone && errors.phone}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="location"
                    label="Location"
                    fullWidth
                    error={touched.location && !!errors.location}
                    helperText={touched.location && errors.location}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="bio"
                    label="Bio"
                    multiline
                    rows={4}
                    fullWidth
                    error={touched.bio && !!errors.bio}
                    helperText={touched.bio && errors.bio}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Field
                    as={TextField}
                    name="age"
                    label="Age"
                    type="number"
                    fullWidth
                    error={touched.age && !!errors.age}
                    helperText={touched.age && errors.age}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Field
                    as={TextField}
                    name="occupation"
                    label="Occupation"
                    fullWidth
                    error={touched.occupation && !!errors.occupation}
                    helperText={touched.occupation && errors.occupation}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <Field
                    as={TextField}
                    name="university"
                    label="University"
                    fullWidth
                    error={touched.university && !!errors.university}
                    helperText={touched.university && errors.university}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="budgetMin"
                    label="Budget Min ($)"
                    type="number"
                    fullWidth
                    error={touched.budgetMin && !!errors.budgetMin}
                    helperText={touched.budgetMin && errors.budgetMin}
                  />
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="budgetMax"
                    label="Budget Max ($)"
                    type="number"
                    fullWidth
                    error={touched.budgetMax && !!errors.budgetMax}
                    helperText={touched.budgetMax && errors.budgetMax}
                  />
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Lifestyle Preferences</InputLabel>
                    <Select
                      multiple
                      value={selectedLifestyle}
                      onChange={handleLifestyleChange}
                      input={<OutlinedInput label="Lifestyle Preferences" />}
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {(selected as string[]).map((value) => (
                            <Chip key={value} label={value} size="small" />
                          ))}
                        </Box>
                      )}
                    >
                      {lifestyleOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <FormControl fullWidth>
                    <InputLabel>Interests</InputLabel>
                    <Select
                      multiple
                      value={selectedInterests}
                      onChange={handleInterestsChange}
                      input={<OutlinedInput label="Interests" />}
                      renderValue={(selected) => (
                        <Box
                          sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}
                        >
                          {(selected as string[]).map((value) => (
                            <Chip
                              key={value}
                              label={value}
                              size="small"
                              color="primary"
                            />
                          ))}
                        </Box>
                      )}
                    >
                      {interestOptions.map((option) => (
                        <MenuItem key={option} value={option}>
                          {option}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Box display="flex" gap={2} justifyContent="flex-end">
                    <Button
                      variant="outlined"
                      startIcon={<CancelIcon />}
                      onClick={() => navigate("/profile")}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      variant="contained"
                      startIcon={<SaveIcon />}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Changes"}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Paper>
    </Container>
  );
};

export default EditProfile;
