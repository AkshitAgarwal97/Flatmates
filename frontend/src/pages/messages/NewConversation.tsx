import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { createConversation } from "../../redux/slices/messageSlice";
import { RootState, useAppDispatch } from "../../redux/store";
import axios from "axios";

// MUI components
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import ListItemText from "@mui/material/ListItemText";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";

// MUI icons
import SearchIcon from "@mui/icons-material/Search";
import PersonIcon from "@mui/icons-material/Person";
import HomeIcon from "@mui/icons-material/Home";

// Types
interface User {
  _id: string;
  name: string;
  avatar?: string;
  userType?: string;
}

interface AuthState {
  user: User | null;
}

interface NewConversationProps {
  open: boolean;
  onClose: () => void;
  propertyId?: string | null;
  ownerId?: string | null;
}

const NewConversation = ({
  open,
  onClose,
  propertyId = null,
  ownerId = null,
}: NewConversationProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state: RootState) => state.auth as AuthState);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searching, setSearching] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Auto-fetch owner details when ownerId is provided
  useEffect(() => {
    const fetchOwnerDetails = async () => {
      if (ownerId && !selectedUser && open) {
        try {
          setLoading(true);
          const response = await axios.get(`/api/users/${ownerId}`);
          const ownerData = response.data;
          
          // Auto-select the owner
          setSelectedUser(ownerData);
          
          // Auto-generate a message if coming from a property
          if (propertyId && !message) {
            setMessage(
              `Hi! I'm interested in your property. Could you tell me more about it?`
            );
          }
        } catch (err) {
          console.error("Error fetching owner details:", err);
          setError("Unable to load property owner information. Please search manually.");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchOwnerDetails();
  }, [ownerId, selectedUser, open, propertyId, message]);

  // Check if we're coming from a property page
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const propertyIdFromQuery = queryParams.get("propertyId");
    const ownerIdFromQuery = queryParams.get("ownerId");

    if (propertyIdFromQuery && !propertyId) {
      // Handle property ID from query params if not provided as prop
    }
    if (ownerIdFromQuery && !ownerId) {
      // Handle owner ID from query params if not provided as prop
    }
  }, [location.search, propertyId, ownerId]);

  // Search users when search term changes
  useEffect(() => {
    const searchUsersDebounced = async () => {
      if (searchTerm.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const response = await axios.get(`/api/users`, {
          params: { search: searchTerm }
        });
        // Filter out current user from search results
        const filteredResults = response.data.users.filter(
          (userResult: User) => userResult._id !== user?._id
        );
        setSearchResults(filteredResults);
      } catch (err) {
        console.error("Error searching users:", err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsersDebounced, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, user]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setSearchResults([]);
      setSelectedUser(null);
      setMessage("");
      setError("");
    }
  }, [open]);

  // Handle user selection
  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSearchTerm("");
    setSearchResults([]);

    // Auto-generate a message if coming from a property
    if (propertyId && !message) {
      setMessage(
        `Hi! I'm interested in your property. Could you tell me more about it?`
      );
    }
  };

  // Handle conversation creation
  const handleCreateConversation = async () => {
    if (!selectedUser) {
      setError("Please select a user to message");
      return;
    }

    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const result = await dispatch(
        createConversation({
          recipient: selectedUser._id,
          initialMessage: message.trim(),
          property: propertyId || undefined,
        }) as any
      ).unwrap();

      // Close dialog and navigate to the new conversation
      onClose();
      navigate(`/messages/${result._id}`);
    } catch (err: any) {
      console.error("Error creating conversation:", err);
      setError(err.message || "Failed to create conversation");
    } finally {
      setLoading(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        New Conversation
        {propertyId && (
          <Chip
            icon={<HomeIcon />}
            label="Property Related"
            size="small"
            color="primary"
            sx={{ ml: 1 }}
          />
        )}
      </DialogTitle>

      <DialogContent>
        {!selectedUser ? (
          // User selection phase
          <Box>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search users by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            {searching && (
              <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
                <CircularProgress size={24} />
              </Box>
            )}

            {searchResults.length > 0 && (
              <Paper elevation={2} sx={{ maxHeight: 200, overflow: "auto" }}>
                <List>
                  {searchResults.map((user) => (
                    <ListItem
                      key={user._id}
                      button
                      onClick={() => handleUserSelect(user)}
                    >
                      <ListItemAvatar>
                        <Avatar src={user.avatar} alt={user.name}>
                          {!user.avatar && <PersonIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.name}
                        secondary={user.userType}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}

            {searchTerm.length >= 2 &&
              searchResults.length === 0 &&
              !searching && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ textAlign: "center", my: 2 }}
                >
                  No users found
                </Typography>
              )}
          </Box>
        ) : (
          // Message composition phase
          <Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                mb: 2,
                p: 1,
                bgcolor: "grey.100",
                borderRadius: 1,
              }}
            >
              <Avatar
                src={selectedUser.avatar}
                alt={selectedUser.name}
                sx={{ mr: 2 }}
              >
                {!selectedUser.avatar && <PersonIcon />}
              </Avatar>
              <Box>
                <Typography variant="subtitle1">{selectedUser.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedUser.userType}
                </Typography>
              </Box>
              <Button
                size="small"
                onClick={() => setSelectedUser(null)}
                sx={{ ml: "auto" }}
              >
                Change
              </Button>
            </Box>

            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Type your message here..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              sx={{ mb: 2 }}
            />

            {propertyId && (
              <Typography variant="caption" color="text.secondary">
                This conversation is related to a property listing
              </Typography>
            )}
          </Box>
        )}

        {error && (
          <Typography color="error" variant="body2" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleCreateConversation}
          variant="contained"
          disabled={!selectedUser || !message.trim() || loading}
        >
          {loading ? <CircularProgress size={24} /> : "Start Conversation"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewConversation;
