import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Message as MessageIcon,
  Home as HomeIcon,
  Notifications as NotificationsIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../redux/store';
import { formatDistanceToNow } from 'date-fns';
import { loadUser } from '../redux/slices/authSlice';

const Notifications: React.FC = () => {
  React.useEffect(() => { document.title = "Notifications | Flatmates"; }, []);
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const notifications = user?.notifications || [];

  useEffect(() => {
    // Refresh user data to get latest notifications
    dispatch(loadUser());
  }, [dispatch]);

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
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">
          Notifications
        </Typography>
      </Box>

      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        {notifications.length === 0 ? (
          <Box p={4} textAlign="center">
            <Typography color="text.secondary">No notifications yet.</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification: any, index: number) => (
              <React.Fragment key={notification._id || index}>
                <ListItem
                  sx={{
                    py: 2,
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 50 }}>
                    {getIcon(notification.type)}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <Typography variant="body1" fontWeight={notification.read ? 400 : 600}>
                        {notification.content}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {notification.createdAt
                          ? formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true,
                            })
                          : 'Just now'}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Container>
  );
};

export default Notifications;
