import React, { useState } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Message as MessageIcon,
  Home as HomeIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RootState } from '../../redux/store';
import { formatDistanceToNow } from 'date-fns';

const NotificationCenter: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  
  // Safe access to notifications
  const notifications = user?.notifications || [];
  const unreadCount = notifications.filter((n: any) => !n.read).length;

  const handleOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'message':
        return <MessageIcon color="primary" />;
      case 'property_update':
        return <HomeIcon color="secondary" />;
      case 'match':
        return <NotificationsIcon color="success" />;
      default:
        return <InfoIcon color="action" />;
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box p={2} pb={1}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        <Divider />
        {notifications.length === 0 ? (
          <Box p={3} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.slice(0, 5).map((notification: any, index: number) => (
              <React.Fragment key={notification._id || index}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40, mt: 0.5 }}>
                    {getIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={notification.content}
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {notification.createdAt
                          ? formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })
                          : 'Just now'}
                      </Typography>
                    }
                    primaryTypographyProps={{
                      variant: 'body2',
                      color: notification.read ? 'text.primary' : 'text.primary',
                      fontWeight: notification.read ? 400 : 600,
                    }}
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider component="li" />}
              </React.Fragment>
            ))}
          </List>
        )}
        <Divider />
        <Box p={1} textAlign="center">
          <Typography
            variant="button"
            color="primary"
            sx={{ cursor: 'pointer', fontSize: '0.75rem' }}
            onClick={() => {
              handleClose();
              navigate('/notifications');
            }}
          >
            View All
          </Typography>
        </Box>
      </Menu>
    </>
  );
};

export default NotificationCenter;
