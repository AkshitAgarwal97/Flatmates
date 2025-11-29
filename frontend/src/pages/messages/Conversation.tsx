import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { getMessages, sendMessage } from "../../redux/slices/messageSlice";
import { socketService } from "../../services/socketService";
import { RootState } from "../../redux/store";
import { AppDispatch } from "../../redux/store";

// MUI components
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
// removed unused: Tooltip

// MUI icons
import SendIcon from "@mui/icons-material/Send";
import AttachFileIcon from "@mui/icons-material/AttachFile";
// removed unused: ImageIcon
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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
  address: {
    city: string;
    state: string;
  };
  price: {
    amount: number;
    brokerage?: number;
  };
  images?: string[];
}

interface Attachment {
  _id: string;
  url: string;
  filename: string;
  mimetype: string;
}

interface Message {
  _id: string;
  content?: string;
  sender: string | User | any; // Accept string (user ID), User object, or ObjectId object
  attachments?: Attachment[];
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
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const { user } = useSelector((state: RootState) => state.auth as AuthState);
  const { currentConversation, messages, loading } = useSelector(
    (state: RootState) => state.message as ConversationState
  );

  const [messageText, setMessageText] = useState<string>("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isSending, setIsSending] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get other participant (not the current user)
  const otherParticipant = currentConversation?.participants?.find(
    (participant) => participant._id !== user?._id
  );

  // Fetch messages when conversation ID changes
  useEffect(() => {
    if (id) {
      dispatch(getMessages(id));

      // Join the conversation room via socket
      socketService.joinConversation(id);

      // Mark messages as read
      socketService.markMessagesAsRead(id);

      // Clean up when leaving the conversation
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

    // Clear previous timeout
    if (typingTimeout) {
      clearTimeout(typingTimeout);
    }

    // Set new timeout
    const timeout = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        socketService.typing(id!, false);
      }
    }, 2000);

    setTypingTimeout(timeout);

    // Clean up
    return () => {
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    };
  }, [messageText, isTyping, id, typingTimeout]);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Handle file input change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB max
      if (!isValidSize) {
        alert("File size should not exceed 5MB");
      }
      return isValidSize;
    });

    if (validFiles.length === 0) return;

    // Add to attachments
    setAttachments([...attachments, ...validFiles]);

    // Reset file input
    e.target.value = "";
  };

  // Remove attachment
  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  // Handle message submission
  const handleSendMessage = async () => {
    if ((!messageText.trim() && attachments.length === 0) || isSending) return;

    setIsSending(true);

    try {
      await dispatch(
        sendMessage({
          conversationId: id!,
          content: messageText.trim(),
          attachments: attachments,
        })
      );

      // Clear form
      setMessageText("");
      setAttachments([]);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Format timestamp
  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if same day
    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }

    // Check if yesterday
    if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    }

    // Otherwise show date and time
    return (
      date.toLocaleDateString([], { month: "short", day: "numeric" }) +
      ", " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  // Group messages by date
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

  // Format date header
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

  // Render attachment preview
  const renderAttachmentPreview = (file: File, index: number) => {
    const isImage = file.type.startsWith("image/");

    return (
      <Box
        key={index}
        sx={{
          position: "relative",
          display: "inline-block",
          m: 0.5,
          borderRadius: 1,
          overflow: "hidden",
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        {isImage ? (
          <Box
            component="img"
            src={URL.createObjectURL(file)}
            alt="Attachment preview"
            sx={{ width: 80, height: 80, objectFit: "cover" }}
          />
        ) : (
          <Box
            sx={{
              width: 80,
              height: 80,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "action.hover",
            }}
          >
            <InsertDriveFileIcon />
          </Box>
        )}
        <IconButton
          size="small"
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            bgcolor: "rgba(0,0,0,0.5)",
            color: "white",
            "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
            p: 0.2,
          }}
          onClick={() => handleRemoveAttachment(index)}
        >
          ×
        </IconButton>
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: "rgba(0,0,0,0.5)",
            color: "white",
            textOverflow: "ellipsis",
            overflow: "hidden",
            whiteSpace: "nowrap",
            px: 1,
          }}
        >
          {file.name.length > 10
            ? `${file.name.substring(0, 7)}...`
            : file.name}
        </Typography>
      </Box>
    );
  };

  // Render message attachment
  const renderMessageAttachment = (attachment: Attachment) => {
    const isImage = attachment.mimetype.startsWith("image/");

    if (isImage) {
      return (
        <Box
          key={String(attachment._id)}
          component="img"
          src={attachment.url}
          alt="Attachment"
          sx={{
            maxWidth: "100%",
            maxHeight: 200,
            borderRadius: 1,
            mb: 1,
          }}
        />
      );
    }

    return (
      <Box
        key={String(attachment._id)}
        component="a"
        href={attachment.url}
        target="_blank"
        rel="noopener noreferrer"
        sx={{
          display: "flex",
          alignItems: "center",
          p: 1,
          mb: 1,
          borderRadius: 1,
          bgcolor: "action.hover",
          textDecoration: "none",
          color: "text.primary",
        }}
      >
        <InsertDriveFileIcon sx={{ mr: 1 }} />
        <Typography variant="body2" noWrap>
          {attachment.filename}
        </Typography>
      </Box>
    );
  };

  // Render property card if conversation has a property
  const renderPropertyCard = () => {
    if (!currentConversation?.property) return null;

    const property = currentConversation.property;

    return (
      <Card sx={{ mb: 2 }}>
        <CardMedia
          component="img"
          height="140"
          image={
            property.images && property.images.length > 0
              ? property.images[0]
              : "https://picsum.photos/seed/no-image-convo/300/140"
          }
          alt={property.title}
        />
        <CardContent>
          <Typography variant="h6" component="div" noWrap>
            {property.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {property.address.city}, {property.address.state}
          </Typography>
          <Typography variant="body1" sx={{ mt: 1 }}>
            ${property.price.amount}
            {property.price.brokerage && property.price.brokerage > 0 ? (
              <span> (Brokerage: {property.price.brokerage})</span>
            ) : null}
          </Typography>
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
                <Typography variant="h6">{otherParticipant.name}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {otherParticipant?.userType
                    ? otherParticipant.userType
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")
                    : "User"}
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Paper>

      {/* Property Card (if applicable) */}
      {renderPropertyCard()}

      {/* Messages Container */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 2,
          flexGrow: 1,
          overflow: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Typography variant="body1" color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          <>
            {Object.entries(groupMessagesByDate()).map(
              ([date, dateMessages]) => (
                <Box key={date}>
                  <Divider sx={{ my: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                      {formatDateHeader(date)}
                    </Typography>
                  </Divider>

                  {dateMessages.map((message) => {
                    // Handle sender which can be: string ID, ObjectId object, or User object
                    let senderId: string;
                    
                    if (typeof message.sender === 'string') {
                      senderId = message.sender;
                    } else if (message.sender && typeof message.sender === 'object') {
                      // Check if it's a User object with _id
                      if ('_id' in message.sender && message.sender._id) {
                        // User object with _id
                        if (typeof message.sender._id === 'string') {
                          senderId = message.sender._id;
                        } else {
                          // Handle ObjectId object
                          const json = JSON.parse(JSON.stringify(message.sender._id));
                          senderId = typeof json === 'string' ? json : (json.$oid || json.toString());
                        }
                      } else {
                        // It's an ObjectId - convert via JSON to get the actual ID string
                        const jsonStr = JSON.stringify(message.sender);
                        try {
                          const parsed = JSON.parse(jsonStr);
                          senderId = parsed.$oid || parsed.toString() || jsonStr.replace(/[{}"]/g, '');
                        } catch {
                          senderId = jsonStr.replace(/[{}"]/g, '');
                        }
                      }
                    } else {
                      senderId = '';
                    }
                    
                    const senderUser =
                      typeof message.sender === "object" && message.sender?.name
                        ? message.sender  // Already populated User object
                        : currentConversation?.participants.find(
                            (p) => p._id === senderId
                          );
                    
                    const isCurrentUser = senderId === user?._id;

                    const getStringId = (id: any): string => {
                      if (typeof id === 'string') return id;
                      if (!id) return Math.random().toString();
                      const json = JSON.parse(JSON.stringify(id));
                      return typeof json === 'string' ? json : (json.$oid || json.toString());
                    };

                    return (
                      <Box
                        key={getStringId(message._id)}
                        sx={{
                          display: "flex",
                          flexDirection: isCurrentUser ? "row-reverse" : "row",
                          mb: 2,
                        }}
                      >
                        {!isCurrentUser && senderUser && (
                          <Avatar
                            src={senderUser.avatar}
                            alt={senderUser.name}
                            sx={{ mr: 1, mt: 1 }}
                          />
                        )}

                        <Box
                          sx={{
                            maxWidth: "70%",
                            bgcolor: isCurrentUser
                              ? "primary.light"
                              : "background.default",
                            color: isCurrentUser
                              ? "primary.contrastText"
                              : "text.primary",
                            borderRadius: 2,
                            p: 2,
                            position: "relative",
                          }}
                        >
                          {/* Message attachments */}
                          {message.attachments &&
                            message.attachments.length > 0 && (
                              <Box sx={{ mb: message.content ? 1 : 0 }}>
                                {message.attachments.map((attachment) =>
                                  renderMessageAttachment(attachment)
                                )}
                              </Box>
                            )}

                          {/* Message content */}
                          {message.content && (
                            <Typography variant="body1">
                              {message.content}
                            </Typography>
                          )}

                          {/* Message timestamp */}
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              textAlign: "right",
                              mt: 0.5,
                              color: isCurrentUser
                                ? "rgba(255,255,255,0.7)"
                                : "text.secondary",
                            }}
                          >
                            {formatMessageTime(message.createdAt)}
                            {message.read && isCurrentUser && (
                              <span style={{ marginLeft: "4px" }}>✓</span>
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })}
                </Box>
              )
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </Paper>

      {/* Message Input */}
      <Paper elevation={2} sx={{ p: 2 }}>
        {/* Attachment previews */}
        {attachments.length > 0 && (
          <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap" }}>
            {attachments.map((file, index) =>
              renderAttachmentPreview(file, index)
            )}
          </Box>
        )}

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <IconButton onClick={() => fileInputRef.current?.click()}>
            <AttachFileIcon />
          </IconButton>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={handleFileChange}
            multiple
          />

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
            disabled={
              (!messageText.trim() && attachments.length === 0) || isSending
            }
          >
            {isSending ? <CircularProgress size={24} /> : "Send"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default Conversation;
