import React, { useState, useEffect } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { login, clearError } from "../../redux/slices/authSlice";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, RootState } from "../../redux/store";

// MUI components
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import Link from "@mui/material/Link";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";

// MUI icons
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

// Types
interface LoginFormValues {
  email: string;
  password: string;
}

// Validation schema
const validationSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: Yup.string()
    .min(6, "Password should be of minimum 6 characters length")
    .required("Password is required"),
});

const Login = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );
  const [rememberMe, setRememberMe] = useState(false);
  const [errorDialog, setErrorDialog] = useState<{
    open: boolean;
    message: string;
    showRegisterButton: boolean;
    showForgotPasswordButton: boolean;
  }>({
    open: false,
    message: '',
    showRegisterButton: false,
    showForgotPasswordButton: false
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  // Clear error when component unmounts (user navigates away)
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  // Show error dialog if login fails
  useEffect(() => {
    if (error) {
      // Don't show dialog for "No token found" - this is expected when user first visits
      if (error === 'No token found' || (typeof error === 'string' && error.includes('No token found'))) {
        return;
      }
      
      const errorData = typeof error === 'object' ? error : { errors: [{ msg: error }] };
      const errorMsg = errorData?.errors?.[0]?.msg || errorData?.msg || 'Login failed';
      const errorType = errorData?.errors?.[0]?.type;
      
      setErrorDialog({
        open: true,
        message: errorMsg,
        showRegisterButton: errorType === 'USER_NOT_FOUND',
        showForgotPasswordButton: errorType === 'INVALID_PASSWORD'
      });
    }
  }, [error]);

  const handleCloseErrorDialog = () => {
    setErrorDialog({ open: false, message: '', showRegisterButton: false, showForgotPasswordButton: false });
    dispatch(clearError());
  };

  const handleNavigateToRegister = () => {
    navigate('/register');
  };

  const handleNavigateToForgotPassword = () => {
    navigate('/forgot-password');
  };

  // Formik setup
  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: validationSchema,
    onSubmit: (values: LoginFormValues) => {
      dispatch(login(values) as any);
    },
  });

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage:
            "url(https://picsum.photos/seed/apartment-login/1600/900)",
          backgroundRepeat: "no-repeat",
          backgroundColor: (t) =>
            t.palette.mode === "light"
              ? t.palette.grey[50]
              : t.palette.grey[900],
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            my: 8,
            mx: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>

          <Box
            component="form"
            noValidate
            onSubmit={formik.handleSubmit}
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formik.values.email}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
            />
            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
              }
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Sign In"}
            </Button>
            <Grid container>
              <Grid item xs>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  variant="body2"
                >
                  Forgot password?
                </Link>
              </Grid>
              <Grid item>
                <Link component={RouterLink} to="/register" variant="body2">
                  {"Don't have an account? Sign Up"}
                </Link>
              </Grid>
            </Grid>
            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                By signing in, you agree to our{" "}
                <Link component={RouterLink} to="/privacy" color="primary">
                  Privacy Policy
                </Link>
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Error Dialog */}
        <Dialog
          open={errorDialog.open}
          onClose={handleCloseErrorDialog}
          aria-labelledby="error-dialog-title"
        >
          <DialogTitle id="error-dialog-title">
            Login Failed
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              {errorDialog.message}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            {errorDialog.showRegisterButton && (
              <Button onClick={handleNavigateToRegister} color="primary" variant="contained">
                Register
              </Button>
            )}
            {errorDialog.showForgotPasswordButton && (
              <Button onClick={handleNavigateToForgotPassword} color="primary" variant="contained">
                Forgot Password
              </Button>
            )}
            <Button onClick={handleCloseErrorDialog} color="primary" autoFocus>
              Retry
            </Button>
          </DialogActions>
        </Dialog>
      </Grid>
    </Grid>
  );
};

export default Login;
