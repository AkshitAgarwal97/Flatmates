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
  socket = io('/', {
    auth: {
      token
    }
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
  socket.on('message', (data: any) => {
    dispatch(receiveMessage({
      message: data.message,
      conversationId: data.conversationId
    }));
  });

  // Handle read receipts
  socket.on('messageRead', (data: any) => {
    dispatch(markConversationAsRead(data.conversationId));
  });

  // Handle unread count updates
  socket.on('unreadCount', (data: any) => {
    dispatch(updateTotalUnreadCount(data.count));
  });

  return socket;
};

// Join a conversation room
const joinConversation = (conversationId: string) => {
  if (socket) {
    socket.emit('joinConversation', { conversationId });
  }
};

// Leave a conversation room
const leaveConversation = (conversationId: string) => {
  if (socket) {
    socket.emit('leaveConversation', { conversationId });
  }
};

// Send a message
const emitMessage = (conversationId: string, message: any) => {
  if (socket) {
    socket.emit('sendMessage', { conversationId, message });
  }
};

// Send typing indicator
const emitTyping = (conversationId: string, isTyping: boolean) => {
  if (socket) {
    socket.emit('typing', { conversationId, isTyping });
  }
};

// Mark messages as read
const emitReadReceipt = (conversationId: string) => {
  if (socket) {
    socket.emit('markAsRead', { conversationId });
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