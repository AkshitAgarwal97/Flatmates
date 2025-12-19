import React from 'react';
import { Breadcrumbs as MUIBreadcrumbs, Link, Typography, Container, Box } from '@mui/material';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

const breadcrumbNameMap: { [key: string]: string } = {
  '/properties': 'Properties',
  '/properties/create': 'Create Listing',
  '/dashboard': 'Dashboard',
  '/profile': 'Profile',
  '/messages': 'Messages',
  '/roommates': 'Find Roommates',
  '/privacy': 'Privacy Policy',
};

const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Don't show breadcrumbs on homepage
  if (pathnames.length === 0) {
    return null;
  }

  return (
    <Box sx={{ bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'grey.200', py: 1.5 }}>
      <Container maxWidth="lg">
        <MUIBreadcrumbs 
          aria-label="breadcrumb" 
          separator={<NavigateNextIcon fontSize="small" />}
        >
          <Link
            underline="hover"
            color="inherit"
            component={RouterLink}
            to="/"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            Home
          </Link>
          {pathnames.map((value, index) => {
            const last = index === pathnames.length - 1;
            const to = `/${pathnames.slice(0, index + 1).join('/')}`;

            // Handle dynamic IDs (e.g., property ID) by showing a generic "Details" or similar if not in map
            const name = breadcrumbNameMap[to] || (pathnames[index - 1] === 'properties' ? 'Property Details' : value.charAt(0).toUpperCase() + value.slice(1));

            return last ? (
              <Typography color="text.primary" key={to}>
                {name}
              </Typography>
            ) : (
              <Link
                underline="hover"
                color="inherit"
                component={RouterLink}
                to={to}
                key={to}
              >
                {name}
              </Link>
            );
          })}
        </MUIBreadcrumbs>
      </Container>
    </Box>
  );
};

export default Breadcrumbs;
