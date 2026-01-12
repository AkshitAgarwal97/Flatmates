import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  getConversations,
  archiveConversation,
} from "../../redux/slices/messageSlice";
import { socketService } from "../../services/socketService";
import NewConversation from "./NewConversation";
import { RootState, useAppDispatch } from "../../redux/store";

// MUI components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Badge from "@mui/material/Badge";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import InputBase from "@mui/material/InputBase";
import Skeleton from "@mui/material/Skeleton";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";

// MUI icons
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArchiveIcon from "@mui/icons-material/Archive";
import DeleteIcon from "@mui/icons-material/Delete";
import HomeIcon from "@mui/icons-material/Home";
import AddIcon from "@mui/icons-material/Add";

// Types
interface User {
  _id: string;
  name: string;
  avatar?: string;
}

interface Property {
  _id: string;
  title: string;
}

interface Message {
  _id: string;
  content?: string;
  attachments?: any[];
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
  property?: Property;
}

interface AuthState {
  user: User | null;
}

const ConversationList = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state: RootState) => state.auth as AuthState);
  const { conversations, loading } = useSelector(
    (state: RootState) => state.message as any
  );

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [newConversationOpen, setNewConversationOpen] =
    useState<boolean>(false);

  // Fetch conversations on component mount
  useEffect(() => {
    dispatch(getConversations());
  }, [dispatch]);

  // Handle menu open
  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    conversation: Conversation
  ) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedConversation(conversation);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedConversation(null);
  };

  // Handle archive conversation
  const handleArchiveConversation = () => {
    if (selectedConversation) {
      dispatch(archiveConversation(selectedConversation._id));
      handleMenuClose();
    }
  };

  // Navigate to conversation
  const handleConversationClick = (conversationId: string) => {
    navigate(`/messages/${conversationId}`);

    // Mark messages as read via socket
    socketService.markMessagesAsRead(conversationId);
  };

  // Format last message time
  const formatLastMessageTime = (timestamp?: string) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  // Get other participant (not the current user)
  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(
      (participant) => participant._id !== user?._id
    );
  };

  // Filter conversations based on search term
  const filteredConversations = conversations.filter(
    (conversation: Conversation) => {
      const otherParticipant = getOtherParticipant(conversation);
      if (!otherParticipant || !otherParticipant.name) return false;

      return otherParticipant.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    }
  );

  // Render conversation item
  const renderConversationItem = (conversation: Conversation) => {
    const otherParticipant = getOtherParticipant(conversation);
    if (!otherParticipant) return null;

    const isActive = location.pathname === `/messages/${conversation._id}`;
    const lastMessage = conversation.lastMessage;

    return (
      <React.Fragment key={conversation._id}>
        <ListItem disablePadding>
          <ListItemButton
            selected={isActive}
            onClick={() => handleConversationClick(conversation._id)}
            sx={{
              py: 2,
              px: 3,
              borderLeft: isActive ? "4px solid" : "4px solid transparent",
              borderColor: "primary.main",
              "&.Mui-selected": {
                bgcolor: "action.selected",
                "&:hover": {
                  bgcolor: "action.selected",
                },
              },
            }}
          >
            <ListItemAvatar>
              <Badge
                color="success"
                overlap="circular"
                badgeContent=" "
                variant="dot"
                invisible={!conversation.unreadCount} // Use unread count to show dot? Or should this be online status?
                // Actually unreadCount is better shown as a number badge.
                // Let's use the badge for unread count properly.
                sx={{ '& .MuiBadge-badge': { right: 5, top: 40 } }}
              >
                 <Avatar
                  alt={otherParticipant.name}
                  src={otherParticipant.avatar}
                  sx={{ width: 48, height: 48, mr: 1 }}
                />
              </Badge>
            </ListItemAvatar>

            <ListItemText
              primary={
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 0.5,
                  }}
                >
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: conversation.unreadCount > 0 ? 700 : 500,
                      color: "text.primary",
                    }}
                    noWrap
                  >
                    {otherParticipant.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap', ml: 1 }}>
                    {formatLastMessageTime(lastMessage?.createdAt)}
                  </Typography>
                </Box>
              }
              secondary={
                <Box>
                   <Typography
                    variant="body2"
                    color={conversation.unreadCount > 0 ? "text.primary" : "text.secondary"}
                    sx={{
                      fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                      display: "block",
                      maxWidth: "100%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap"
                    }}
                  >
                    {lastMessage ? (
                      lastMessage.attachments && lastMessage.attachments.length > 0 ? (
                        "📎 Attachment"
                      ) : (
                        lastMessage.content || "Start a conversation"
                      )
                    ) : (
                      "No messages yet"
                    )}
                  </Typography>

                  {conversation.property && (
                    <Chip
                      icon={<HomeIcon fontSize="inherit" />}
                      label={conversation.property.title}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        mt: 1, 
                        maxWidth: "100%", 
                        height: 24, 
                        fontSize: '0.75rem',
                        '& .MuiChip-label': { px: 1 } 
                      }}
                    />
                  )}
                </Box>
              }
            />

            {conversation.unreadCount > 0 && (
               <Box sx={{ ml: 2, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                 <Badge 
                    badgeContent={conversation.unreadCount} 
                    color="primary" 
                    max={99}
                    sx={{ '& .MuiBadge-badge': { position: 'static', transform: 'none', ml: 1 } }}
                  />
               </Box>
            )}

            <ListItemSecondaryAction sx={{ top: 24, right: 16 }}>
              <IconButton
                edge="end"
                onClick={(e) => handleMenuOpen(e, conversation)}
                size="small"
                sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
              >
                <MoreVertIcon fontSize="small" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItemButton>
        </ListItem>
        <Divider component="li" variant="inset" />
      </React.Fragment>
    );
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", bgcolor: 'background.paper', borderRight: 1, borderColor: 'divider' }}>
      {/* Header / Search */}
      <Box sx={{ p: 2, bgcolor: 'background.paper', zIndex: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2, justifyContent: 'space-between' }}>
            <Typography variant="h5" fontWeight="bold">Messages</Typography>
            <IconButton 
              color="primary" 
              onClick={() => setNewConversationOpen(true)}
              sx={{ bgcolor: 'primary.light', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.main' } }}
            >
              <AddIcon />
            </IconButton>
        </Box>
        
        <Paper
          component="form"
          elevation={0}
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            bgcolor: 'action.hover',
            borderRadius: 2,
            border: 1,
            borderColor: 'transparent',
            '&:focus-within': {
                borderColor: 'primary.main',
                bgcolor: 'background.paper'
            }
          }}
        >
          <IconButton sx={{ p: "8px" }} aria-label="search" disabled>
            <SearchIcon color="action" />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Paper>
      </Box>

      {/* Conversations list */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
        }}
      >
        {loading ? (
          <List>
            {[...Array(5)].map((_, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start" sx={{ px: 3, py: 2 }}>
                  <ListItemAvatar>
                    <Skeleton variant="circular" width={48} height={48} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Skeleton width="60%" height={24} />}
                    secondary={
                      <React.Fragment>
                         <Skeleton width="90%" />
                         <Skeleton width="40%" />
                      </React.Fragment>
                    }
                  />
                </ListItem>
                <Divider variant="inset" />
              </React.Fragment>
            ))}
          </List>
        ) : filteredConversations.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              p: 3,
              opacity: 0.7
            }}
          >
            <Typography variant="body1" color="text.secondary" align="center" gutterBottom>
              {searchTerm
                ? "No matching conversations"
                : "No conversations yet"}
            </Typography>
            {!searchTerm && (
                <Button variant="outlined" startIcon={<AddIcon />} onClick={() => setNewConversationOpen(true)}>
                    Start Chat
                </Button>
            )}
          </Box>
        ) : (
          <List sx={{ width: "100%", p: 0 }}>
            {filteredConversations.map((conversation: Conversation) =>
              renderConversationItem(conversation)
            )}
          </List>
        )}
      </Box>

      {/* Conversation actions menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleArchiveConversation}>
          <ArchiveIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
          Archive
        </MenuItem>
        <MenuItem onClick={handleMenuClose} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1.5 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* New Conversation Dialog */}
      <NewConversation
        open={newConversationOpen}
        onClose={() => setNewConversationOpen(false)}
      />
    </Box>
  );
};

export default ConversationList;
