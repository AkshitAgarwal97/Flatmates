import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchMessages, sendMessage } from "../../redux/slices/messageSlice";
import { socketService } from "../../services/socketService";
import { RootState, AppDispatch } from "../../redux/store";

// MUI components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";

// MUI icons
import SendIcon from "@mui/icons-material/Send";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

// Types
interface User {
  _id: string;
  name: string;
  avatar?: string;
}

interface Property {
  _id: string;
  title: string;
  address?: {
    city?: string;
    state?: string;
  };
  price?: {
    amount?: number;
    brokerage?: number;
  };
  images?: any[];
}

interface Message {
  _id: string;
  content?: string;
  sender: string | User | any;
  createdAt: string;
  read?: boolean;
}

interface ConversationData {
  _id: string;
  participants: User[];
  property?: Property;
}

interface ConversationState {
  currentConversation: ConversationData | null;
  messages: Message[];
  loading: boolean;
}

interface AuthState {
  user: User | null;
}

const Conversation = () => {
  React.useEffect(() => {
    document.title = "Chat Conversation | Flatmates";
  }, []);

  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth as AuthState);
  const { currentConversation, messages, loading } = useSelector(
    (state: RootState) => state.message as ConversationState
  );

  const [messageText, setMessageText] = useState<string>("");
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get other participant (not the current user)
  const otherParticipant = currentConversation?.participants?.find(
    (participant) => participant._id !== user?._id
  );

  // Fetch messages when conversation ID changes
  useEffect(() => {
    if (id) {
      dispatch(fetchMessages(id));
      socketService.joinConversation(id);
      socketService.markMessagesAsRead(id);

      return () => {
        socketService.leaveConversation(id);
      };
    }
  }, [dispatch, id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle typing indicator
  useEffect(() => {
    if (messageText && !isTyping) {
      setIsTyping(true);
      socketService.typing(id!, true);
    }

    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    const timeout = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socketService.typing(id!, false);
      }
    }, 2000);

    setTypingTimeout(timeout);

    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [messageText, isTyping, id, typingTimeout]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || isSending) return;

    setIsSending(true);

    try {
      await dispatch(
        sendMessage({
          conversationId: id!,
          content: messageText.trim(),
          attachments: [],
        })
      );
      setMessageText("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    return (
      date.toLocaleDateString([], { month: "short", day: "numeric" }) +
      ", " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const groupMessagesByDate = () => {
    const groups: Record<string, Message[]> = {};

    messages.forEach((message) => {
      const date = new Date(message.createdAt).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });

    return groups;
  };

  const formatDateHeader = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return date.toLocaleDateString([], {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const renderPropertyCard = () => {
    if (!currentConversation?.property) return null;

    const property = currentConversation.property;
    const firstImg = property.images && property.images.length > 0
      ? (typeof property.images[0] === 'string' ? property.images[0] : property.images[0]?.url)
      : undefined;

    const locationText = [property.address?.city, property.address?.state].filter(Boolean).join(", ");

    return (
      <Card sx={{ mb: 2 }}>
        <CardMedia
          component="img"
          height="140"
          image={firstImg || "https://picsum.photos/seed/no-image-convo/300/140"}
          alt={property.title || "Property"}
        />
        <CardContent>
          <Typography variant="h6" component="div" noWrap>
            {property.title}
          </Typography>
          {locationText && (
            <Typography variant="body2" color="text.secondary">
              {locationText}
            </Typography>
          )}
          {property.price?.amount !== undefined && (
            <Typography variant="body1" sx={{ mt: 1 }}>
              ₹{property.price.amount.toLocaleString()}
              {property.price.brokerage && property.price.brokerage > 0 ? (
                <span> (Brokerage: ₹{property.price.brokerage})</span>
              ) : null}
            </Typography>
          )}
          <Button
            size="small"
            sx={{ mt: 1 }}
            onClick={() => navigate(`/properties/${property._id}`)}
          >
            View Property
          </Button>
        </CardContent>
      </Card>
    );
  };

  if (loading && !currentConversation) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "calc(100vh - 180px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Conversation Header */}
      <Paper elevation={2} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton sx={{ mr: 1 }} onClick={() => navigate("/messages")}>
            <ArrowBackIcon />
          </IconButton>
          {otherParticipant && (
            <>
              <Avatar
                src={otherParticipant.avatar}
                alt={otherParticipant.name}
                sx={{ mr: 2 }}
              />
              <Box>
                <Typography variant="h6" fontWeight="bold">{otherParticipant.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {currentConversation?.property 
                    ? `Property: ${currentConversation.property.title}` 
                    : ((otherParticipant as any)?.occupation || (otherParticipant as any)?.gender || "Member")}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Paper>

      {/* Property Card (if applicable) */}
      {renderPropertyCard()}

      {/* Messages Container */}
      <Box
        sx={{
          flexGrow: 1,
          overflow: "auto",
          bgcolor: 'grey.100',
          display: "flex",
          flexDirection: "column",
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url("https://www.transparenttextures.com/patterns/subtle-white-feathers.png")',
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              p: 3
            }}
          >
            <CircularProgress size={30} />
          </Box>
        ) : messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: 'column',
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              p: 4,
              opacity: 0.6
            }}
          >
            <Box sx={{ bgcolor: 'grey.200', p: 3, borderRadius: '50%', mb: 2 }}>
              <SendIcon sx={{ fontSize: 40, color: 'grey.500' }} />
            </Box>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No messages here yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Send a message to start the conversation!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ p: 2 }}>
            {Object.entries(groupMessagesByDate()).map(
              ([date, dateMessages]) => (
                <Box key={date} sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, position: 'sticky', top: 0, zIndex: 1 }}>
                    <Box sx={{ 
                      bgcolor: 'rgba(224, 224, 224, 0.8)', 
                      borderRadius: 4, 
                      px: 2, 
                      py: 0.5, 
                      backdropFilter: 'blur(4px)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      <Typography variant="caption" color="text.secondary" fontWeight="500">
                        {formatDateHeader(date)}
                      </Typography>
                    </Box>
                  </Box>

                  {dateMessages.map((message, index) => {
                    let senderId = '';
                    let senderName = 'Unknown';
                    let senderAvatar = '';

                    const sender = message.sender;
                    
                    if (sender && typeof sender === 'object' && sender.name) {
                      senderId = sender._id;
                      senderName = sender.name;
                      senderAvatar = sender.avatar;
                    } else if (typeof sender === 'string') {
                      senderId = sender;
                      const p = currentConversation?.participants.find(p => p._id === sender);
                      if (p) {
                        senderName = p.name;
                        senderAvatar = p.avatar || '';
                      }
                    } else if (sender && typeof sender === 'object') {
                      senderId = sender.toString();
                      const p = currentConversation?.participants.find(p => p._id === senderId);
                      if (p) {
                        senderName = p.name;
                        senderAvatar = p.avatar || '';
                      }
                    }

                    const isCurrentUser = senderId === user?._id;
                    const isSequence = index > 0 && dateMessages[index - 1].sender === message.sender;

                    return (
                      <Box
                        key={message._id || index}
                        sx={{
                          display: "flex",
                          flexDirection: isCurrentUser ? "row-reverse" : "row",
                          mb: isSequence ? 0.5 : 2,
                          alignItems: 'flex-end'
                        }}
                      >
                        {!isCurrentUser && (
                          <Avatar
                            src={senderAvatar}
                            alt={senderName}
                            sx={{ 
                              width: 28, 
                              height: 28, 
                              mr: 1, 
                              mb: 0.5,
                              visibility: isSequence ? 'hidden' : 'visible'
                            }}
                          />
                        )}

                        <Box
                          sx={{
                            maxWidth: "75%",
                            minWidth: "60px", 
                            bgcolor: isCurrentUser ? "primary.main" : "white",
                            color: isCurrentUser ? "primary.contrastText" : "text.primary",
                            borderRadius: 2,
                            borderTopRightRadius: isCurrentUser && !isSequence ? 0 : 2,
                            borderTopLeftRadius: !isCurrentUser && !isSequence ? 0 : 2,
                            p: 1.5,
                            pl: isCurrentUser ? 1.5 : 2,
                            pr: isCurrentUser ? 2 : 1.5,
                            position: "relative",
                            boxShadow: isCurrentUser ? 2 : 1,
                            wordBreak: 'break-word',
                            '&:before': (!isSequence) ? {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              [isCurrentUser ? 'right' : 'left']: -6,
                              width: 0,
                              height: 0,
                              borderStyle: 'solid',
                              borderWidth: '0 6px 6px 0',
                              borderColor: `transparent ${isCurrentUser ? '#1565c0' : 'white'} transparent transparent`,
                              transform: isCurrentUser ? 'rotate(0deg)' : 'rotate(0deg) scaleX(-1)',
                              zIndex: 0
                            } : {}
                          }}
                        >
                          {message.content && (
                            <Typography variant="body1" sx={{ lineHeight: 1.4, fontSize: '0.95rem' }}>
                              {message.content}
                            </Typography>
                          )}

                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mt: 0.5, opacity: 0.8 }}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontSize: '0.7rem',
                                color: isCurrentUser ? "inherit" : "text.secondary",
                                mr: 0.5
                              }}
                            >
                              {formatMessageTime(message.createdAt)}
                            </Typography>
                            {isCurrentUser && (
                              <span style={{ fontSize: '0.7rem', display: 'flex' }}>
                                {message.read ? '✓✓' : '✓'}
                              </span>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )
            )}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </Box>

      {/* Message Input */}
      <Paper elevation={2} sx={{ p: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <TextField
            fullWidth
            placeholder="Type a message..."
            variant="outlined"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            multiline
            maxRows={4}
            sx={{ mx: 1 }}
          />

          <Button
            variant="contained"
            color="primary"
            endIcon={<SendIcon />}
            onClick={handleSendMessage}
            disabled={!messageText.trim() || isSending}
          >
            {isSending ? <CircularProgress size={24} /> : "Send"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Conversation;
