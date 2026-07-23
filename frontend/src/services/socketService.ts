import io, { Socket } from 'socket.io-client';
import { receiveMessage, markConversationAsRead, updateTotalUnreadCount } from '../redux/slices/messageSlice';
import { showAlert } from '../redux/slices/alertSlice';
import { AppDispatch } from '../redux/store';

let socket: typeof Socket | null = null;

const initSocket = (token: string, dispatch: AppDispatch) => {
  // Close existing socket if it exists
  if (socket) {
    socket.close();
  }

  // Create new socket connection with auth token
  // Use REACT_APP_API_URL if defined (production), otherwise fallback to localhost (dev)
  const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  socket = io(SOCKET_URL, {
    auth: {
      token
    },
    transports: ['websocket']
  });

  // Socket event listeners
  socket.on('connect', () => {
    console.log('Socket connected');
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('error', (error: any) => {
    console.error('Socket error:', error);
    dispatch(showAlert('error', 'Connection error. Please try again.'));
  });

  // Handle incoming messages
  socket.on('new-message', (data: any) => {
    dispatch(receiveMessage({
      message: data,
      conversationId: data.conversation
    }));
  });

  // Handle read receipts
  socket.on('messages-read', (data: any) => {
    dispatch(markConversationAsRead(data.conversationId));
  });

  // Handle unread count updates
  socket.on('unreadCount', (data: any) => {
    dispatch(updateTotalUnreadCount(data.count));
  });

  // Handle general notifications (matches, system, etc)
  socket.on('notification', (data: any) => {
    // Import addNotification dynamically to avoid circular dependencies if any
    const { addNotification } = require('../redux/slices/authSlice');
    dispatch(addNotification(data));
  });

  return socket;
};

// Join a conversation room
const joinConversation = (conversationId: string) => {
  if (socket) {
    socket.emit('join-conversation', conversationId);
  }
};

// Leave a conversation room
const leaveConversation = (conversationId: string) => {
  if (socket) {
    socket.emit('leave-conversation', conversationId);
  }
};

// Send a message
const emitMessage = (conversationId: string, message: any) => {
  if (socket) {
    socket.emit('send-message', { conversationId, content: message.content, attachments: message.attachments });
  }
};

// Send typing indicator
const emitTyping = (conversationId: string, isTyping: boolean) => {
  if (socket) {
    socket.emit(isTyping ? 'typing' : 'stop-typing', conversationId);
  }
};

// Mark messages as read
const emitReadReceipt = (conversationId: string) => {
  if (socket) {
    socket.emit('mark-read', conversationId);
  }
};

// Close socket connection
export const closeSocket = () => {
  if (socket) {
    socket.close();
    socket = null;
  }
};

// Export socketService object
export const socketService = {
  init: (dispatch: AppDispatch) => {
    const token = localStorage.getItem('token');
    if (token) {
      return initSocket(token, dispatch);
    }
    return null;
  },
  disconnect: closeSocket,
  joinConversation,
  leaveConversation,
  sendMessage: emitMessage,
  typing: emitTyping, // This is what we use for typing status
  markMessagesAsRead: emitReadReceipt
};