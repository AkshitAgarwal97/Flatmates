import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { Link as RouterLink } from "react-router-dom";
import { getProperties } from "../redux/slices/propertySlice";
import { getConversations } from "../redux/slices/messageSlice";
import { useAppDispatch } from "../redux/store";

// MUI components
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Skeleton from "@mui/material/Skeleton";
import Paper from "@mui/material/Paper";

// MUI icons
import HomeIcon from "@mui/icons-material/Home";
import MessageIcon from "@mui/icons-material/Message";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import AddIcon from "@mui/icons-material/Add";

// Types
interface Property {
  _id: string;
  title: string;
  address: {
    city: string;
    state: string;
  };
  price: {
    amount: number;
    brokerage?: number;
  };
}

interface User {
  _id: string;
  name: string;
  avatar?: string;
}

interface Message {
  content: string;
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  unreadCount: number;
}

interface AuthState {
  user: User | null;
}

interface PropertyState {
  userListings: Property[];
  savedProperties: Property[];
  loading: boolean;
}

interface MessageState {
  conversations: Conversation[];
  unreadCount: number;
  loading: boolean;
}

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { user } = useSelector((state: RootState) => state.auth as AuthState);
  const {
    userListings,
    savedProperties,
    loading: propertiesLoading,
  } = useSelector((state: RootState) => state.property as PropertyState);
  const {
    conversations,
    unreadCount,
    loading: messagesLoading,
  } = useSelector((state: RootState) => state.message as any);

  // Fetch user's properties and conversations on component mount
  useEffect(() => {
    dispatch(getProperties({ limit: 3, userOnly: true }) as any);
    dispatch(getConversations() as any);
  }, [dispatch]);

  // Welcome message based on time of day
  const getWelcomeMessage = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {getWelcomeMessage()}, {user?.name}!
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome to your Flatmates dashboard. Here's an overview of your
          activity.
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* User's Listings Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" component="h2">
                Your Listings
              </Typography>
              <Button
                component={RouterLink}
                to="/properties/create"
                variant="outlined"
                startIcon={<AddIcon />}
                size="small"
              >
                Add New
              </Button>
            </Box>

            {propertiesLoading ? (
              // Loading skeleton
              Array.from(new Array(3)).map((_, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Skeleton variant="rectangular" height={118} />
                  <Skeleton />
                  <Skeleton width="60%" />
                </Box>
              ))
            ) : userListings && userListings.length > 0 ? (
              // User has listings
              userListings.slice(0, 3).map((property) => (
                <Card key={property._id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" component="div" noWrap>
                      {property.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      gutterBottom
                    >
                      {property.address.city}, {property.address.state}
                    </Typography>
                    <Typography variant="body2">
                      {property.price.amount}
                      {property.price.brokerage &&
                      property.price.brokerage > 0 ? (
                        <span> (Brokerage: {property.price.brokerage})</span>
                      ) : null}
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/properties/${property._id}`}
                    >
                      View
                    </Button>
                    <Button
                      size="small"
                      component={RouterLink}
                      to={`/properties/edit/${property._id}`}
                    >
                      Edit
                    </Button>
                  </CardActions>
                </Card>
              ))
            ) : (
              // No listings
              <Box sx={{ textAlign: "center", py: 4 }}>
                <HomeIcon
                  sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="body1" gutterBottom>
                  You haven't created any listings yet.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/properties/create"
                  variant="contained"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                >
                  Create Your First Listing
                </Button>
              </Box>
            )}

            {userListings && userListings.length > 0 && (
              <Box sx={{ mt: 2, textAlign: "right" }}>
                <Button component={RouterLink} to="/properties/my-listings">
                  View All Listings
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Messages Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={2} sx={{ p: 3, height: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" component="h2">
                Recent Messages
              </Typography>
              <Badge badgeContent={unreadCount} color="error">
                <MessageIcon />
              </Badge>
            </Box>

            {messagesLoading ? (
              // Loading skeleton
              Array.from(new Array(3)).map((_, index) => (
                <Box key={index} sx={{ display: "flex", mb: 2 }}>
                  <Skeleton
                    variant="circular"
                    width={40}
                    height={40}
                    sx={{ mr: 2 }}
                  />
                  <Box sx={{ width: "100%" }}>
                    <Skeleton width="60%" />
                    <Skeleton />
                  </Box>
                </Box>
              ))
            ) : conversations && conversations.length > 0 ? (
              // User has conversations
              <List sx={{ width: "100%", bgcolor: "background.paper" }}>
                {conversations.slice(0, 5).map((conversation: any) => {
                  // Find the other participant (not the current user)
                  const otherParticipant = conversation.participants.find(
                    (participant: any) => participant._id !== user?._id
                  );

                  return (
                    <React.Fragment key={conversation._id}>
                      <ListItem
                        alignItems="flex-start"
                        component={RouterLink}
                        to={`/messages/${conversation._id}`}
                        sx={{
                          textDecoration: "none",
                          color: "inherit",
                          bgcolor:
                            conversation.unreadCount > 0
                              ? "action.hover"
                              : "inherit",
                          "&:hover": { bgcolor: "action.hover" },
                        }}
                      >
                        <ListItemAvatar>
                          <Badge
                            overlap="circular"
                            anchorOrigin={{
                              vertical: "bottom",
                              horizontal: "right",
                            }}
                            variant="dot"
                            color="success"
                            invisible={!conversation.unreadCount}
                          >
                            <Avatar
                              alt={otherParticipant?.name}
                              src={otherParticipant?.avatar}
                            />
                          </Badge>
                        </ListItemAvatar>
                        <ListItemText
                          primary={otherParticipant?.name}
                          secondary={
                            <React.Fragment>
                              <Typography
                                sx={{ display: "inline" }}
                                component="span"
                                variant="body2"
                                color="text.primary"
                              >
                                {conversation.lastMessage?.content &&
                                conversation.lastMessage?.content.length > 30
                                  ? `${conversation.lastMessage?.content.substring(
                                      0,
                                      30
                                    )}...`
                                  : conversation.lastMessage?.content || ""}
                              </Typography>
                              {` — ${new Date(
                                conversation.lastMessage?.createdAt || ""
                              ).toLocaleDateString()}`}
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                      <Divider variant="inset" component="li" />
                    </React.Fragment>
                  );
                })}
              </List>
            ) : (
              // No conversations
              <Box sx={{ textAlign: "center", py: 4 }}>
                <MessageIcon
                  sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="body1" gutterBottom>
                  You don't have any messages yet.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/properties"
                  variant="contained"
                  sx={{ mt: 2 }}
                >
                  Browse Properties
                </Button>
              </Box>
            )}

            {conversations && conversations.length > 0 && (
              <Box sx={{ mt: 2, textAlign: "right" }}>
                <Button component={RouterLink} to="/messages">
                  View All Messages
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Saved Properties Section */}
        <Grid item xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6" component="h2">
                Saved Properties
              </Typography>
              <BookmarkIcon />
            </Box>

            {propertiesLoading ? (
              // Loading skeleton
              <Grid container spacing={3}>
                {Array.from(new Array(3)).map((_, index) => (
                  <Grid item xs={12} sm={6} md={4} key={index}>
                    <Skeleton variant="rectangular" height={118} />
                    <Skeleton />
                    <Skeleton width="60%" />
                  </Grid>
                ))}
              </Grid>
            ) : savedProperties && savedProperties.length > 0 ? (
              // User has saved properties
              <Grid container spacing={3}>
                {savedProperties.slice(0, 3).map((property) => (
                  <Grid item xs={12} sm={6} md={4} key={property._id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6" component="div" noWrap>
                          {property.title}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          gutterBottom
                        >
                          {property.address.city}, {property.address.state}
                        </Typography>
                        <Typography variant="body2">
                          {property.price.amount}
                          {property.price.brokerage &&
                          property.price.brokerage > 0 ? (
                            <span>
                              {" "}
                              (Brokerage: {property.price.brokerage})
                            </span>
                          ) : null}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <Button
                          size="small"
                          component={RouterLink}
                          to={`/properties/${property._id}`}
                        >
                          View Details
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              // No saved properties
              <Box sx={{ textAlign: "center", py: 4 }}>
                <BookmarkIcon
                  sx={{ fontSize: 60, color: "text.secondary", mb: 2 }}
                />
                <Typography variant="body1" gutterBottom>
                  You haven't saved any properties yet.
                </Typography>
                <Button
                  component={RouterLink}
                  to="/properties"
                  variant="contained"
                  sx={{ mt: 2 }}
                >
                  Browse Properties
                </Button>
              </Box>
            )}

            {savedProperties && savedProperties.length > 0 && (
              <Box sx={{ mt: 2, textAlign: "right" }}>
                <Button component={RouterLink} to="/saved">
                  View All Saved Properties
                </Button>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};

export default Dashboard;
