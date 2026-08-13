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
  FormControlLabel,
  Switch,
  Divider,
} from "@mui/material";
import {
  PhotoCamera as PhotoCameraIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { updateProfile, loadUser } from "../../redux/slices/authSlice";
import { RootState, AppDispatch } from "../../redux/store";
import { User } from "../../types";

interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  age: string;
  gender: string;
  occupation: string;
  university: string;
  budgetMin: string;
  budgetMax: string;
  food: string;
  isRoommateListed: boolean;
}

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
  gender: Yup.string().nullable(),
  occupation: Yup.string().nullable(),
  university: Yup.string().nullable(),
  budgetMin: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0, "Budget must be positive")
    .nullable(),
  budgetMax: Yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0, "Budget must be positive")
    .nullable(),
  food: Yup.string().nullable(),
  isRoommateListed: Yup.boolean(),
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
  React.useEffect(() => { document.title = "Edit Profile | Flatmates"; }, []);
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
  const [saveSuccess, setSaveSuccess] = useState(false);

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
      setSelectedInterests((user.preferences as any)?.interests || []);
    }
  }, [user]);

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting }: FormikHelpers<FormValues>
  ) => {
    try {
      const updateData: any = {
        name: `${values.firstName} ${values.lastName}`.trim(),
        email: values.email,
        phone: values.phone,
        location: values.location,
        bio: values.bio,
        gender: values.gender,
        occupation: values.occupation,
        university: values.university,
        isRoommateListed: values.isRoommateListed,
        personalLifestyle: {
          food: values.food || 'Veg',
        },
        preferences: {
          location: values.location ? [values.location] : [],
          budget: {
            min: Number(values.budgetMin) || 0,
            max: Number(values.budgetMax) || 0,
          },
          lifestyle: selectedLifestyle,
          interests: selectedInterests,
        },
        avatar: profileImage || undefined,
      };

      if (values.age) {
        const currentYear = new Date().getFullYear();
        const birthYear = currentYear - Number(values.age);
        updateData.dob = new Date(`${birthYear}-01-01`).toISOString();
      }

      await dispatch(updateProfile(updateData)).unwrap();
      setSaveSuccess(true);
      setTimeout(() => {
        navigate("/profile");
      }, 1500);
    } catch (err) {
      console.error("Profile update failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setProfileImage(file);
    }
  };

  const handleLifestyleChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedLifestyle(event.target.value as string[]);
  };

  const handleInterestsChange = (event: SelectChangeEvent<string[]>) => {
    setSelectedInterests(event.target.value as string[]);
  };

  const profileData: any = user || {};
  const dobYear = profileData.dob ? new Date(profileData.dob).getFullYear() : null;
  const computedAge = dobYear ? new Date().getFullYear() - dobYear : profileData.age || "";

  const initialValues: FormValues = {
    firstName: profileData.firstName || profileData.name?.split(' ')[0] || "",
    lastName: profileData.lastName || profileData.name?.split(' ').slice(1).join(' ') || "",
    email: profileData.email || "",
    phone: profileData.phone || "",
    location: (profileData.preferences?.location && profileData.preferences.location[0]) || profileData.location || "",
    bio: profileData.bio || "",
    age: computedAge.toString(),
    gender: profileData.gender || "Male",
    occupation: profileData.occupation || "Professional",
    university: profileData.university || "",
    budgetMin: profileData.preferences?.budget?.min?.toString() || profileData.budget?.min?.toString() || "5000",
    budgetMax: profileData.preferences?.budget?.max?.toString() || profileData.budget?.max?.toString() || "25000",
    food: profileData.personalLifestyle?.food || "Veg",
    isRoommateListed: !!profileData.isRoommateListed,
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Edit Profile
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {saveSuccess && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Profile updated successfully! Redirecting...
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
            setFieldValue,
            isSubmitting,
          }) => (
            <Form>
              <Grid container spacing={3}>
                <Grid item xs={12} display="flex" justifyContent="center" mb={3}>
                  <Box position="relative">
                    <Avatar
                      src={
                        profileImage
                          ? URL.createObjectURL(profileImage)
                          : profileData.avatar
                      }
                      sx={{ width: 120, height: 120 }}
                    >
                      {profileData.name?.[0]}
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

                <Grid item xs={12} sm={6}>
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
                  <FormControl fullWidth>
                    <InputLabel id="gender-select-label">Gender</InputLabel>
                    <Select
                      labelId="gender-select-label"
                      name="gender"
                      value={values.gender}
                      label="Gender"
                      onChange={handleChange}
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="location"
                    label="Preferred City/Area"
                    fullWidth
                    error={touched.location && !!errors.location}
                    helperText={touched.location && errors.location}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Field
                    as={TextField}
                    name="bio"
                    label="Bio / About Yourself"
                    multiline
                    rows={3}
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
                  <FormControl fullWidth>
                    <InputLabel id="occupation-select-label">Occupation</InputLabel>
                    <Select
                      labelId="occupation-select-label"
                      name="occupation"
                      value={values.occupation}
                      label="Occupation"
                      onChange={handleChange}
                    >
                      <MenuItem value="Student">Student</MenuItem>
                      <MenuItem value="Professional">Professional</MenuItem>
                      <MenuItem value="WFH">WFH</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="food-select-label">Dietary Preference</InputLabel>
                    <Select
                      labelId="food-select-label"
                      name="food"
                      value={values.food}
                      label="Dietary Preference"
                      onChange={handleChange}
                    >
                      <MenuItem value="Veg">Veg</MenuItem>
                      <MenuItem value="Non-Veg">Non-Veg</MenuItem>
                      <MenuItem value="Eggetarian">Eggetarian</MenuItem>
                      <MenuItem value="Vegan">Vegan</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Field
                    as={TextField}
                    name="budgetMin"
                    label="Min Budget (₹)"
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
                    label="Max Budget (₹)"
                    type="number"
                    fullWidth
                    error={touched.budgetMax && !!errors.budgetMax}
                    helperText={touched.budgetMax && errors.budgetMax}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={values.isRoommateListed}
                        onChange={(e) => setFieldValue("isRoommateListed", e.target.checked)}
                        color="primary"
                      />
                    }
                    label={
                      <Typography fontWeight="bold" color="primary">
                        List me on the Roommates Finder page
                      </Typography>
                    }
                  />
                  <Typography variant="caption" color="text.secondary" display="block">
                    Enable this so other members looking for a roommate in your city can view your profile.
                  </Typography>
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
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
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
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {(selected as string[]).map((value) => (
                            <Chip key={value} label={value} size="small" color="primary" />
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
