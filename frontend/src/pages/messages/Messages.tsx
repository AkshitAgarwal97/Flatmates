import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import { socketService } from "../../services/socketService";
import { AppDispatch } from "../../redux/store";
import { createConversation } from "../../redux/slices/messageSlice";

// Components
import ConversationList from "./ConversationList";
import Conversation from "./Conversation";

// MUI components
import { Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Hidden from "@mui/material/Hidden";
import Container from "@mui/material/Container";

const Messages = () => {
  React.useEffect(() => { document.title = "Messages | Flatmates"; }, []);
  const dispatch: AppDispatch = useDispatch();
  const location = useLocation();

  // Initialize socket connection when component mounts
  useEffect(() => {
    socketService.init(dispatch);

    return () => {
      socketService.disconnect();
    };
  }, [dispatch]);

  // Check if we're on the main messages page or a specific conversation
  const isConversationSelected = location.pathname !== "/messages";

  // Handle ?userId= param to start a new conversation
  const query = new URLSearchParams(location.search);
  const targetUserId = query.get('userId');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (targetUserId) {
        // Here we should check if a conversation already exists with this user
        // But since we don't have the list fully loaded or indexed by user, we can try to create
        // The backend 'createConversation' should return existing one if found
        dispatch(createConversation({ recipientId: targetUserId }))
            .unwrap()
            .then((newConv) => {
                navigate(`/messages/${newConv._id}`, { replace: true });
            })
            .catch((err) => {
                console.error("Failed to start conversation", err);
            });
    }
  }, [targetUserId, dispatch, navigate]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Grid container spacing={3}>
        {/* Conversation List - Always visible on desktop, hidden on mobile when viewing a conversation */}
        <Hidden smDown={isConversationSelected}>
          <Grid item xs={12} md={4}>
            <ConversationList />
          </Grid>
        </Hidden>

        {/* Conversation Detail - Full width on mobile, 8 columns on desktop */}
        <Grid item xs={12} md={isConversationSelected ? 8 : 12}>
          <Routes>
            <Route
              path="/"
              element={
                <Hidden smUp>
                  <ConversationList />
                </Hidden>
              }
            />
            <Route path="/:id" element={<Conversation />} />
          </Routes>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Messages;
