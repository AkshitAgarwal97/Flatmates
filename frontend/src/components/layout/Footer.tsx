import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

// MUI components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';

interface FooterLink {
  name: string;
  path: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const Footer: React.FC = () => {
  const footerLinks: FooterSection[] = [
    {
      title: 'Company',
      links: [
        { name: 'About Us', path: '/about' },
        { name: 'Contact', path: '/contact' },
        { name: 'Careers', path: '/careers' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { name: 'Blog', path: '/blog' },
        { name: 'FAQ', path: '/faq' },
        { name: 'Terms of Service', path: '/terms' },
        { name: 'Privacy Policy', path: '/privacy' },
      ],
    },
    {
      title: 'Connect',
      links: [
        { name: 'Facebook', path: 'https://facebook.com/flatmates.india' },
        { name: 'Twitter', path: 'https://twitter.com/flatmates_in' },
        { name: 'Instagram', path: 'https://instagram.com/flatmates.co.in' },
      ],
    },
  ];

  return (
    <Box
      component="footer"
      sx={{
        py: 6,
        px: 2,
        mt: 'auto',
        backgroundColor: (theme) =>
          theme.palette.mode === 'light'
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4} justifyContent="space-evenly">
          {footerLinks.map((section) => (
            <Grid item xs={12} sm={4} key={section.title}>
              <Typography variant="h6" color="text.primary" gutterBottom>
                {section.title}
              </Typography>
              <Box>
                {section.links.map((link) => (
                  <Box key={link.name} sx={{ py: 0.5 }}>
                    <Link
                      component={link.path.startsWith('http') ? 'a' : RouterLink}
                      to={!link.path.startsWith('http') ? link.path : undefined}
                      href={link.path.startsWith('http') ? link.path : undefined}
                      color="text.secondary"
                      underline="hover"
                      target={link.path.startsWith('http') ? '_blank' : undefined}
                      rel={link.path.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {link.name}
                    </Link>
                  </Box>
                ))}
              </Box>
            </Grid>
          ))}
        </Grid>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body2" color="text.secondary" align="center">
          {'© '}
          {new Date().getFullYear()}
          {' '}
          <Link color="inherit" component={RouterLink} to="/">
            Flatmates
          </Link>
          {'. All rights reserved.'}
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;