// Imports reorganized
import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { AppDispatch, RootState } from "../../redux/store";
import { logout } from "../../redux/slices/authSlice";
import { closeSocket } from "../../services/socketService";

// Custom components
import MessageNotification from "../ui/MessageNotification";
import Alert from "../ui/Alert";

// MUI components
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Badge,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";

// MUI icons
import {
  Menu as MenuIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Message as MessageIcon,
  Bookmark as BookmarkIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

// Types
interface User {
  name?: string;
  avatar?: string;
}
interface AuthState {
  token: string | null;
  isAuthenticated: boolean | null;
  loading: boolean;
  user: User | null;
  error: string | null;
  needsProfileCompletion: boolean; // Use this instead of profileCompleted
}

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { isAuthenticated = false, user = null } = useSelector(
    (state: RootState) => {
      const auth = state.auth as AuthState;
      return {
        isAuthenticated: Boolean(auth.isAuthenticated),
        user: auth.user,
      };
    }
  );
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  // Handle opening/closing the mobile drawer
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Handle opening the user menu
  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  // Handle closing the user menu
  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  // Handle logout
  const handleLogout = () => {
    handleCloseUserMenu();
    closeSocket();
    dispatch(logout());
    navigate("/");
  };

  // Drawer content for mobile view
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Flatmates
      </Typography>
      <Divider />
      <List>
        <ListItem button component={RouterLink} to="/">
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>

        <ListItem button component={RouterLink} to="/properties">
          <ListItemIcon>
            <SearchIcon />
          </ListItemIcon>
          <ListItemText primary="Find Properties" />
        </ListItem>

        {isAuthenticated && (
          <>
            <ListItem button component={RouterLink} to="/properties/create">
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="Add Listing" />
            </ListItem>

            <ListItem button component={RouterLink} to="/messages">
              <ListItemIcon>
                <Badge badgeContent={0} color="error">
                  <MessageIcon />
                </Badge>
              </ListItemIcon>
              <ListItemText primary="Messages" />
            </ListItem>

            <ListItem button component={RouterLink} to="/saved">
              <ListItemIcon>
                <BookmarkIcon />
              </ListItemIcon>
              <ListItemText primary="Saved" />
            </ListItem>

            <ListItem button component={RouterLink} to="/profile">
              <ListItemIcon>
                <AccountCircleIcon />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>

            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItem>
          </>
        )}

        {!isAuthenticated && (
          <>
            <ListItem button component={RouterLink} to="/login">
              <ListItemText primary="Login" />
            </ListItem>
            <ListItem button component={RouterLink} to="/register">
              <ListItemText primary="Register" />
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo for desktop */}
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: "none", md: "flex" },
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              FLATMATES
            </Typography>

            {/* Mobile menu icon */}
            <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleDrawerToggle}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
            </Box>

            {/* Logo for mobile */}
            <Typography
              variant="h5"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                fontFamily: "monospace",
                fontWeight: 700,
                letterSpacing: ".3rem",
                color: "inherit",
                textDecoration: "none",
              }}
            >
              FLATMATES
            </Typography>

            {/* Desktop navigation */}
            <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
              <Button
                component={RouterLink}
                to="/properties"
                sx={{ my: 2, color: "white", display: "block" }}
              >
                Find Properties
              </Button>

              {isAuthenticated && (
                <Button
                  component={RouterLink}
                  to="/properties/create"
                  sx={{ my: 2, color: "white", display: "block" }}
                >
                  Add Listing
                </Button>
              )}
            </Box>

            {/* User menu section */}
            <Box sx={{ flexGrow: 0 }}>
              {isAuthenticated ? (
                <>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box sx={{ mr: 2 }}>
                      <MessageNotification />
                    </Box>

                    <IconButton
                      component={RouterLink}
                      to="/saved"
                      sx={{ mr: 2 }}
                      color="inherit"
                    >
                      <BookmarkIcon />
                    </IconButton>

                    <Tooltip title="Open settings">
                      <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                        <Avatar alt={user?.name} src={user?.avatar} />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Menu
                    sx={{ mt: "45px" }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem
                      component={RouterLink}
                      to="/profile"
                      onClick={handleCloseUserMenu}
                    >
                      <ListItemIcon>
                        <AccountCircleIcon fontSize="small" />
                      </ListItemIcon>
                      <Typography textAlign="center">Profile</Typography>
                    </MenuItem>

                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" />
                      </ListItemIcon>
                      <Typography textAlign="center">Logout</Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Box sx={{ display: "flex" }}>
                  <Button
                    component={RouterLink}
                    to="/login"
                    sx={{ color: "white" }}
                  >
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    sx={{ color: "white", ml: 1 }}
                  >
                    Register
                  </Button>
                </Box>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile
          }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Container component="main" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
        <Alert />
        {children}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: "auto",
          backgroundColor: (theme) =>
            theme.palette.mode === "light"
              ? theme.palette.grey[200]
              : theme.palette.grey[800],
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body1" align="center">
            © {new Date().getFullYear()} Flatmates. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Layout;
