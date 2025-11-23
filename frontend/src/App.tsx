import React, { useEffect } from "react";
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

// Pages
import Home from "./pages/Home";
import { Login, Register, AuthSuccess } from "./pages/auth";
import Dashboard from "./pages/Dashboard";
import {
  PropertyListing,
  PropertyDetails,
  CreateProperty,
  EditProperty,
} from "./pages/property";
import { UserProfile, EditProfile } from "./pages/user";
import { Messages } from "./pages/messages";
import NotFound from "./pages/NotFound";

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#1976d2",
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
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/success" element={<AuthSuccess />} />

              <Route element={<PrivateRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
              </Route>

              <Route path="/properties" element={<PropertyListing />} />
              <Route path="/properties/:id" element={<PropertyDetails />} />

              <Route element={<PrivateRoute />}>
                <Route path="/properties/create" element={<CreateProperty />} />
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
                <Route path="/messages" element={<Messages />} />
                <Route path="/messages/:id" element={<Messages />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App;
