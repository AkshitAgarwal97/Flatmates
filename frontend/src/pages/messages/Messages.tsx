import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Routes, Route, useLocation } from "react-router-dom";
import { socketService } from "../../services/socketService";
import { AppDispatch } from "../../redux/store";

// Components
import ConversationList from "./ConversationList";
import Conversation from "./Conversation";

// MUI components
import { Box } from "@mui/material";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Hidden from "@mui/material/Hidden";

const Messages = () => {
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

  return (
    <Box sx={{ py: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Messages
      </Typography>

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
    </Box>
  );
};

export default Messages;
