import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../../redux/slices/authSlice";
import { RootState } from "../../redux/store";

// MUI components
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import HomeIcon from "@mui/icons-material/Home";

interface Page {
  title: string;
  path: string;
}

interface UserMenuItem {
  title: string;
  path?: string;
  onClick: () => void;
}

const Header: React.FC = () => {
  const dispatch = useDispatch();
  interface AuthUser {
    name?: string;
    avatar?: string;
    // add other user properties if needed
  }

  const { isAuthenticated, user } = useSelector(
    (state: RootState): { isAuthenticated: boolean; user?: AuthUser } => {
      const auth = state.auth;
      return {
        isAuthenticated: !!auth.isAuthenticated,
        user: auth.user || undefined,
      };
    }
  );

  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(
    null
  );
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
    null
  );

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElNav(event.currentTarget);
  };

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleCloseUserMenu();
  };

  // Navigation items
  const pages: Page[] = [
    { title: "Properties", path: "/properties" },
    { title: "Find Roommates", path: "/roommates" },
  ];

  // User menu items
  const userMenuItems: UserMenuItem[] = [
    { title: "Dashboard", path: "/dashboard", onClick: handleCloseUserMenu },
    { title: "Profile", path: "/profile", onClick: handleCloseUserMenu },
    { title: "Messages", path: "/messages", onClick: handleCloseUserMenu },
    { title: "Logout", onClick: handleLogout },
  ];

  return (
    <AppBar 
      position="sticky" 
      sx={{ 
        zIndex: (theme) => theme.zIndex.drawer + 1,
        backdropFilter: 'blur(10px)',
        backgroundColor: 'rgba(25, 118, 210, 0.9)',
        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          {/* Desktop Logo */}
          {/* <HomeIcon sx={{ display: { xs: "none", md: "flex" }, mr: 1 }} /> */}
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

          {/* Mobile Navigation Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="open navigation menu"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              {pages.map((page) => (
                <MenuItem
                  key={page.title}
                  onClick={handleCloseNavMenu}
                  component={RouterLink}
                  to={page.path}
                >
                  <Typography textAlign="center">{page.title}</Typography>
                </MenuItem>
              ))}
            </Menu>
          </Box>

          {/* Mobile Logo */}
          {/* <HomeIcon sx={{ display: { xs: "flex", md: "none" }, mr: 1 }} /> */}
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

          {/* Desktop Navigation Menu */}
          <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
            {pages.map((page) => (
              <Button
                key={page.title}
                component={RouterLink}
                to={page.path}
                onClick={handleCloseNavMenu}
                sx={{ my: 2, color: "white", display: "block" }}
                aria-label={`Navigate to ${page.title}`}
              >
                {page.title}
              </Button>
            ))}
          </Box>

          {/* User Menu */}
          <Box sx={{ flexGrow: 0 }}>
            {isAuthenticated ? (
              <>
                <Tooltip title="Open settings">
                  <IconButton 
                    aria-label="user profile menu" 
                    onClick={handleOpenUserMenu} 
                    sx={{ p: 0 }}
                  >
                    <Avatar
                      alt={user?.name || "User"}
                      src={user?.avatar || "/static/images/avatar/2.jpg"}
                    />
                  </IconButton>
                </Tooltip>
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
                  {userMenuItems.map((item) =>
                    item.path ? (
                      <MenuItem
                        key={item.title}
                        onClick={item.onClick}
                        component={RouterLink}
                        to={item.path}
                      >
                        <Typography textAlign="center">{item.title}</Typography>
                      </MenuItem>
                    ) : (
                      <MenuItem key={item.title} onClick={item.onClick}>
                        <Typography textAlign="center">{item.title}</Typography>
                      </MenuItem>
                    )
                  )}
                </Menu>
              </>
            ) : (
              <Box sx={{ display: "flex" }}>
                <Button
                  component={RouterLink}
                  to="/login"
                  color="inherit"
                  sx={{ mr: 1 }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  color="inherit"
                  variant="outlined"
                  sx={{
                    borderColor: "white",
                    "&:hover": { borderColor: "white" },
                  }}
                >
                  Register
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header;
