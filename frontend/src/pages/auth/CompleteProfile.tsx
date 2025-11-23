import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { completeProfile } from "../../redux/slices/authSlice";
import { showAlert } from "../../redux/slices/alertSlice";
import { useFormik } from "formik";
import * as Yup from "yup";
import { RootState, AppDispatch } from "../../redux/store";

// MUI components
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";

// MUI icons
import PersonIcon from "@mui/icons-material/Person";

// Types
interface User {
  _id: string;
  name: string;
  email: string;
}

interface Preferences {
  location: string;
  budget: string;
  moveInDate: string;
  duration: string;
  gender: string;
}

interface CompleteProfileFormValues {
  phone: string;
  userType: string;
  bio: string;
  preferences: Preferences;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean | null;
  loading: boolean;
  user: User | null;
  error: string | null;
  needsProfileCompletion: boolean; // Use this instead of profileCompleted
}

// Validation schema
const validationSchema = Yup.object({
  phone: Yup.string()
    .matches(/^[0-9+\-\s]+$/, "Invalid phone number format")
    .required("Phone number is required"),
  userType: Yup.string().required("Please select what you are looking for"),
  bio: Yup.string().max(500, "Bio should not exceed 500 characters"),
});

const CompleteProfile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { user, loading, error, isAuthenticated, needsProfileCompletion } =
    useSelector((state: RootState) => state.auth as AuthState);
  // Redirect if profile is already completed
  useEffect(() => {
    if (isAuthenticated && !needsProfileCompletion) {
      navigate("/dashboard");
    } else if (!isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, needsProfileCompletion, navigate]);

  // Show error alert if profile completion fails
  useEffect(() => {
    if (error) {
      dispatch(showAlert("error", error));
    }
  }, [error, dispatch]);

  // Formik setup
  const formik = useFormik({
    initialValues: {
      phone: "",
      userType: "",
      bio: "",
      preferences: {
        location: "",
        budget: "",
        moveInDate: "",
        duration: "",
        gender: "",
      },
    },
    validationSchema: validationSchema,
    onSubmit: async (values: CompleteProfileFormValues) => {
      dispatch(completeProfile(values) as any);
    },
  });

  return (
    <Container component="main" maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "primary.main", width: 56, height: 56 }}>
            <PersonIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h5">
            Complete Your Profile
          </Typography>
          <Typography
            variant="body1"
            sx={{ mt: 1, mb: 3, textAlign: "center" }}
          >
            Welcome {user?.name}! Please provide a few more details to complete
            your profile.
          </Typography>

          <Box
            component="form"
            noValidate
            onSubmit={formik.handleSubmit}
            sx={{ mt: 1, width: "100%" }}
          >
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="phone"
                  label="Phone Number"
                  name="phone"
                  autoComplete="tel"
                  value={formik.values.phone}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.phone && Boolean(formik.errors.phone)}
                  helperText={formik.touched.phone && formik.errors.phone}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl
                  component="fieldset"
                  error={
                    formik.touched.userType && Boolean(formik.errors.userType)
                  }
                >
                  <FormLabel component="legend">I am:</FormLabel>
                  <RadioGroup
                    aria-label="user-type"
                    name="userType"
                    value={formik.values.userType}
                    onChange={formik.handleChange}
                  >
                    <FormControlLabel
                      value="room_seeker"
                      control={<Radio />}
                      label="Looking for a room in a shared flat"
                    />
                    <FormControlLabel
                      value="roommate_seeker"
                      control={<Radio />}
                      label="Looking for roommates to find a flat together"
                    />
                    <FormControlLabel
                      value="broker_dealer"
                      control={<Radio />}
                      label="Broker/Dealer - Offering rooms/properties on behalf of others"
                    />
                    <FormControlLabel
                      value="property_owner"
                      control={<Radio />}
                      label="Offering a whole property for rent"
                    />
                  </RadioGroup>
                  {formik.touched.userType && formik.errors.userType && (
                    <Typography color="error" variant="caption">
                      {formik.errors.userType}
                    </Typography>
                  )}
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="bio"
                  label="Bio"
                  name="bio"
                  multiline
                  rows={4}
                  placeholder="Tell others about yourself..."
                  value={formik.values.bio}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.bio && Boolean(formik.errors.bio)}
                  helperText={formik.touched.bio && formik.errors.bio}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Preferences (Optional)
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="preferences.location"
                  label="Preferred Location"
                  name="preferences.location"
                  value={formik.values.preferences.location}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="preferences.budget"
                  label="Budget (per month)"
                  name="preferences.budget"
                  type="number"
                  value={formik.values.preferences.budget}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="preferences.moveInDate"
                  label="Move-in Date"
                  name="preferences.moveInDate"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formik.values.preferences.moveInDate}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  id="preferences.duration"
                  label="Stay Duration (months)"
                  name="preferences.duration"
                  type="number"
                  value={formik.values.preferences.duration}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <FormLabel component="legend">Preferred Gender</FormLabel>
                  <RadioGroup
                    row
                    aria-label="gender-preference"
                    name="preferences.gender"
                    value={formik.values.preferences.gender}
                    onChange={formik.handleChange}
                  >
                    <FormControlLabel
                      value="male"
                      control={<Radio />}
                      label="Male"
                    />
                    <FormControlLabel
                      value="female"
                      control={<Radio />}
                      label="Female"
                    />
                    <FormControlLabel
                      value="any"
                      control={<Radio />}
                      label="Any"
                    />
                  </RadioGroup>
                </FormControl>
              </Grid>
            </Grid>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Complete Profile"}
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default CompleteProfile;
