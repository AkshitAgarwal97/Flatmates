import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { socketService } from '../../services/socketService';

// MUI components
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';

// MUI icons
import MailIcon from '@mui/icons-material/Mail';

interface Participant {
  _id: string;
  name?: string;
  avatar?: string;
}

interface LastMessage {
  content?: string;
  createdAt?: string;
}

interface Conversation {
  _id: string;
  participants: Participant[];
  unreadCount: number;
  lastMessage?: LastMessage;
  currentUser?: string;
}

interface MessageState {
  conversations: Conversation[];
  unreadCount: number;
}

interface AuthState {
  isAuthenticated: boolean;
}

const MessageNotification = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { isAuthenticated } = useSelector((state: { auth: AuthState }) => state.auth);
  const { conversations, unreadCount } = useSelector((state: { message: MessageState }) => state.message);
  
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  // Initialize socket when component mounts if user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      socketService.init(dispatch);
    }
    
    return () => {
      if (isAuthenticated) {
        socketService.disconnect();
      }
    };
  }, [dispatch, isAuthenticated]);

  // Handle menu open
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle conversation click
  const handleConversationClick = (conversationId: string) => {
    navigate(`/messages/${conversationId}`);
    handleMenuClose();
    
    // Mark messages as read
    socketService.markMessagesAsRead(conversationId);
  };

  // Format last message time
  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  // Get unread conversations
  const unreadConversations = conversations.filter(conv => conv.unreadCount > 0);
  const unreadTotal = unreadConversations.reduce((total, conv) => total + conv.unreadCount, 0);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <IconButton 
        color="inherit" 
        onClick={handleMenuOpen}
        size="large"
      >
        <Badge badgeContent={unreadCount} color="error">
          <MailIcon />
        </Badge>
      </IconButton>
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, pb: 1 }}>
          <Typography variant="h6">Messages</Typography>
          <Typography variant="body2" color="text.secondary">
            {unreadTotal} unread {unreadTotal === 1 ? 'message' : 'messages'}
          </Typography>
        </Box>
        
        <Divider />
        
        {unreadConversations.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No unread messages
            </Typography>
          </Box>
        ) : (
          <>
            {unreadConversations.slice(0, 5).map((conversation) => {
              const otherParticipant = conversation.participants.find(
                participant => participant._id !== conversation.currentUser
              );
              
              return (
                <MenuItem 
                  key={conversation._id} 
                  onClick={() => handleConversationClick(conversation._id)}
                  sx={{ py: 1.5 }}
                >
                  <ListItemAvatar>
                    <Avatar 
                      alt={otherParticipant?.name || 'User'} 
                      src={otherParticipant?.avatar}
                    />
                  </ListItemAvatar>
                  <ListItemText 
                    primary={
                      <Typography variant="subtitle2" noWrap>
                        {otherParticipant?.name || 'User'}
                      </Typography>
                    }
                    secondary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography 
                          variant="body2" 
                          color="text.secondary" 
                          noWrap 
                          sx={{ maxWidth: '150px' }}
                        >
                          {conversation.lastMessage?.content || 'New conversation'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatLastMessageTime(conversation.lastMessage?.createdAt)}
                        </Typography>
                      </Box>
                    }
                  />
                </MenuItem>
              );
            })}
            
            {unreadConversations.length > 5 && (
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  +{unreadConversations.length - 5} more
                </Typography>
              </Box>
            )}
            
            <Divider />
            
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button 
                fullWidth 
                onClick={() => {
                  navigate('/messages');
                  handleMenuClose();
                }}
              >
                View All Messages
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default MessageNotification;