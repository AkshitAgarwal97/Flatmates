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
  userType?: string;
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
      if (!otherParticipant) return false;

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
        <ListItem
          button
          alignItems="flex-start"
          onClick={() => handleConversationClick(conversation._id)}
          sx={{
            bgcolor: isActive ? "action.selected" : "inherit",
            "&:hover": {
              bgcolor: isActive ? "action.selected" : "action.hover",
            },
            py: 1.5,
          }}
        >
          <ListItemAvatar>
            <Badge
              color="primary"
              badgeContent={conversation.unreadCount}
              invisible={conversation.unreadCount === 0}
              overlap="circular"
            >
              <Avatar
                alt={otherParticipant.name}
                src={otherParticipant.avatar}
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
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight:
                      conversation.unreadCount > 0 ? "bold" : "normal",
                    color:
                      conversation.unreadCount > 0 ? "text.primary" : "inherit",
                  }}
                >
                  {otherParticipant.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatLastMessageTime(lastMessage?.createdAt)}
                </Typography>
              </Box>
            }
            secondary={
              <Box>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    display: "inline",
                    fontWeight:
                      conversation.unreadCount > 0 ? "medium" : "normal",
                    color:
                      conversation.unreadCount > 0 ? "text.primary" : "inherit",
                  }}
                  noWrap
                >
                  {lastMessage ? (
                    lastMessage.attachments &&
                    lastMessage.attachments.length > 0 ? (
                      <Box
                        component="span"
                        sx={{ display: "flex", alignItems: "center" }}
                      >
                        {lastMessage.content
                          ? lastMessage.content
                          : "Sent an attachment"}
                      </Box>
                    ) : (
                      lastMessage?.content
                    )
                  ) : (
                    "No messages yet"
                  )}
                </Typography>

                {conversation.property && (
                  <Chip
                    icon={<HomeIcon fontSize="small" />}
                    label={
                      conversation.property.title.substring(0, 15) +
                      (conversation.property.title.length > 15 ? "..." : "")
                    }
                    size="small"
                    sx={{ mt: 0.5, maxWidth: "100%" }}
                  />
                )}
              </Box>
            }
          />

          <ListItemSecondaryAction>
            <IconButton
              edge="end"
              onClick={(e) => handleMenuOpen(e, conversation)}
              size="small"
            >
              <MoreVertIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
        <Divider component="li" />
      </React.Fragment>
    );
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Search bar and new conversation button */}
      <Box sx={{ display: "flex", mb: 2, gap: 1 }}>
        <Paper
          component="form"
          sx={{
            p: "2px 4px",
            display: "flex",
            alignItems: "center",
            boxShadow: 1,
            flexGrow: 1,
          }}
        >
          <IconButton sx={{ p: "10px" }} aria-label="search">
            <SearchIcon />
          </IconButton>
          <InputBase
            sx={{ ml: 1, flex: 1 }}
            placeholder="Search conversations"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Paper>

        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setNewConversationOpen(true)}
        >
          New
        </Button>
      </Box>

      {/* Conversations list */}
      <Paper
        elevation={2}
        sx={{
          flexGrow: 1,
          overflow: "auto",
          maxHeight: "calc(100vh - 240px)",
        }}
      >
        {loading ? (
          // Loading skeletons
          <List>
            {[...Array(5)].map((_, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemAvatar>
                    <Skeleton variant="circular" width={40} height={40} />
                  </ListItemAvatar>
                  <ListItemText
                    primary={<Skeleton width="70%" />}
                    secondary={
                      <React.Fragment>
                        <Skeleton width="90%" />
                        <Skeleton width="40%" />
                      </React.Fragment>
                    }
                  />
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        ) : filteredConversations.length === 0 ? (
          // No conversations
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              p: 3,
            }}
          >
            <Typography variant="body1" color="text.secondary" align="center">
              {searchTerm
                ? "No conversations match your search"
                : "No conversations yet"}
            </Typography>
          </Box>
        ) : (
          // Conversations list
          <List sx={{ width: "100%", bgcolor: "background.paper", p: 0 }}>
            {filteredConversations.map((conversation: Conversation) =>
              renderConversationItem(conversation)
            )}
          </List>
        )}
      </Paper>

      {/* Conversation actions menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleArchiveConversation}>
          <ArchiveIcon fontSize="small" sx={{ mr: 1 }} />
          Archive
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
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
