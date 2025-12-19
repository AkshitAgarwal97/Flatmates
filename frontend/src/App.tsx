import React, { useEffect, lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Provider } from "react-redux";

// Redux store
import store from "./redux/store";
import { loadUser } from "./redux/slices/authSlice";

// Components
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import PrivateRoute from "./components/routing/PrivateRoute";
import CookieConsent from "./components/ui/CookieConsent";
import Breadcrumbs from "./components/ui/Breadcrumbs";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

// Pages
// Pages
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/auth").then(m => ({ default: m.Login })));
const Register = lazy(() => import("./pages/auth").then(m => ({ default: m.Register })));
const AuthSuccess = lazy(() => import("./pages/auth").then(m => ({ default: m.AuthSuccess })));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const PropertyListing = lazy(() => import("./pages/property").then(m => ({ default: m.PropertyListing })));
const PropertyDetails = lazy(() => import("./pages/property").then(m => ({ default: m.PropertyDetails })));
const CreateProperty = lazy(() => import("./pages/property").then(m => ({ default: m.CreateProperty })));
const EditProperty = lazy(() => import("./pages/property").then(m => ({ default: m.EditProperty })));
const MyListings = lazy(() => import("./pages/property").then(m => ({ default: m.MyListings })));
const UserProfile = lazy(() => import("./pages/user").then(m => ({ default: m.UserProfile })));
const EditProfile = lazy(() => import("./pages/user").then(m => ({ default: m.EditProfile })));
const Messages = lazy(() => import("./pages/messages").then(m => ({ default: m.Messages })));
const NotFound = lazy(() => import("./pages/NotFound"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1565c0", // Darker blue for better contrast
    },
    secondary: {
      main: "#f50057",
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 500,
    },
    h2: {
      fontWeight: 500,
    },
    h3: {
      fontWeight: 500,
    },
  },
});

const App: React.FC = () => {
  useEffect(() => {
    // Check for token and load user
    store.dispatch(loadUser());
  }, []);

  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Header />
          <Breadcrumbs />
          <main>
            <Suspense fallback={
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
              </Box>
            }>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/auth/success" element={<AuthSuccess />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />

                <Route element={<PrivateRoute />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                </Route>

                <Route path="/properties" element={<PropertyListing />} />
                <Route path="/properties/:id" element={<PropertyDetails />} />

                <Route element={<PrivateRoute />}>
                  <Route path="/properties/create" element={<CreateProperty />} />
                </Route>

                <Route element={<PrivateRoute />}>
                  <Route path="/properties/my-listings" element={<MyListings />} />
                </Route>

                <Route element={<PrivateRoute />}>
                  <Route path="/properties/edit/:id" element={<EditProperty />} />
                </Route>

                <Route element={<PrivateRoute />}>
                  <Route path="/profile" element={<UserProfile />} />
                </Route>

                <Route element={<PrivateRoute />}>
                  <Route path="/profile/edit" element={<EditProfile />} />
                </Route>

                <Route element={<PrivateRoute />}>
                  <Route path="/messages/*" element={<Messages />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>
          <Footer />
          <CookieConsent />
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
