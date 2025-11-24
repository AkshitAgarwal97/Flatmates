import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { sendOTP, verifyOTP, resetPassword, resetState } from "../../redux/slices/passwordResetSlice";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useAppDispatch, RootState } from "../../redux/store";

// MUI components
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import LockResetIcon from "@mui/icons-material/LockReset";
import Avatar from "@mui/material/Avatar";

const ForgotPassword = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { loading, error, step, email: savedEmail, message } = useSelector(
    (state: RootState) => state.passwordReset
  );

  const [localEmail, setLocalEmail] = useState("");
  const [localOtp, setLocalOtp] = useState("");

  useEffect(() => {
    // Reset state when component mounts
    dispatch(resetState());
  }, [dispatch]);

  // Email form
  const emailFormik = useFormik({
    initialValues: { email: "" },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Email is required")
    }),
    onSubmit: (values) => {
      setLocalEmail(values.email);
      dispatch(sendOTP(values.email) as any);
    }
  });

  // OTP form
  const otpFormik = useFormik({
    initialValues: { otp: "" },
    validationSchema: Yup.object({
      otp: Yup.string().length(6, "OTP must be 6 digits").required("OTP is required")
    }),
    onSubmit: (values) => {
      setLocalOtp(values.otp);
      dispatch(verifyOTP({ email: savedEmail || localEmail, otp: values.otp }) as any);
    }
  });

  // Password form
  const passwordFormik = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: Yup.object({
      password: Yup.string().min(6, "Password must be at least 6 characters").required("Password is required"),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref("password")], "Passwords must match")
        .required("Confirm password is required")
    }),
    onSubmit: (values) => {
      dispatch(resetPassword({ 
        email: savedEmail || localEmail, 
        otp: localOtp, 
        password: values.password 
      }) as any);
    }
  });

  const handleBackToLogin = () => {
    dispatch(resetState());
    navigate("/login");
  };

  return (
    <Container component="main" maxWidth="sm">
      <Box sx={{ marginTop: 8, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockResetIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          Reset Password
        </Typography>

        <Paper elevation={3} sx={{ mt: 3, p: 4, width: "100%" }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {message && step !== "success" && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          {/* Step 1: Email */}
          {step === "email" && (
            <Box component="form" onSubmit={emailFormik.handleSubmit}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter your email address and we'll send you an OTP to reset your password.
              </Typography>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={emailFormik.values.email}
                onChange={emailFormik.handleChange}
                error={emailFormik.touched.email && Boolean(emailFormik.errors.email)}
                helperText={emailFormik.touched.email && emailFormik.errors.email}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Send OTP"}
              </Button>
              <Button fullWidth variant="text" onClick={handleBackToLogin}>
                Back to Login
              </Button>
            </Box>
          )}

          {/* Step 2: OTP */}
          {step === "otp" && (
            <Box component="form" onSubmit={otpFormik.handleSubmit}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter the 6-digit OTP sent to {savedEmail || localEmail}
              </Typography>
              <TextField
                margin="normal"
                required
                fullWidth
                id="otp"
                label="OTP Code"
                name="otp"
                autoFocus
                inputProps={{ maxLength: 6 }}
                value={otpFormik.values.otp}
                onChange={otpFormik.handleChange}
                error={otpFormik.touched.otp && Boolean(otpFormik.errors.otp)}
                helperText={otpFormik.touched.otp && otpFormik.errors.otp}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Verify OTP"}
              </Button>
              <Button fullWidth variant="text" onClick={() => dispatch(resetState())}>
                Resend OTP
              </Button>
            </Box>
          )}

          {/* Step 3: New Password */}
          {step === "password" && (
            <Box component="form" onSubmit={passwordFormik.handleSubmit}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter your new password
              </Typography>
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="New Password"
                type="password"
                id="password"
                autoFocus
                value={passwordFormik.values.password}
                onChange={passwordFormik.handleChange}
                error={passwordFormik.touched.password && Boolean(passwordFormik.errors.password)}
                helperText={passwordFormik.touched.password && passwordFormik.errors.password}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                value={passwordFormik.values.confirmPassword}
                onChange={passwordFormik.handleChange}
                error={passwordFormik.touched.confirmPassword && Boolean(passwordFormik.errors.confirmPassword)}
                helperText={passwordFormik.touched.confirmPassword && passwordFormik.errors.confirmPassword}
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : "Reset Password"}
              </Button>
            </Box>
          )}

          {/* Step 4: Success */}
          {step === "success" && (
            <Box textAlign="center">
              <Alert severity="success" sx={{ mb: 3 }}>
                {message || "Password reset successfully!"}
              </Alert>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                You can now login with your new password.
              </Typography>
              <Button
                fullWidth
                variant="contained"
                onClick={handleBackToLogin}
              >
                Go to Login
              </Button>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default ForgotPassword;
