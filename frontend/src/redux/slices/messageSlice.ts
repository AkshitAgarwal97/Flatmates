import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { messageAPI, extractResponseData } from '../../services/api';
import {
  Conversation,
  Message,
  MessageState
} from '../../types/index';

// Normalize backend error to a plain string so it can safely be rendered in JSX
const normalizeError = (err: any, fallback: string): string => {
  const data = err?.response?.data;
  if (!data) return fallback;
  if (typeof data === 'string') return data;
  if (data.message && typeof data.message === 'string') return data.message;
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map((e: any) => (typeof e === 'string' ? e : e?.msg || JSON.stringify(e))).join(', ');
  }
  return fallback;
};

// Fetch all conversations for the current user
export const fetchConversations = createAsyncThunk(
  'messages/fetchConversations',
  async (_, { rejectWithValue }) => {
    try {
      const res = await messageAPI.getConversations();
      return extractResponseData(res);
    } catch (err: any) {
      return rejectWithValue(normalizeError(err, 'Failed to fetch conversations'));
    }
  }
);

// Create a new conversation
export const createConversation = createAsyncThunk(
  'messages/createConversation',
  async (
    { recipientId, propertyId, initialMessage }: { recipientId: string; propertyId?: string; initialMessage?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await messageAPI.createConversation({ recipient: recipientId, property: propertyId, initialMessage });
      return extractResponseData(res);
    } catch (err: any) {
      return rejectWithValue(normalizeError(err, 'Failed to create conversation'));
    }
  }
);

// Fetch messages for a specific conversation
export const fetchMessages = createAsyncThunk(
  'messages/fetchMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const res = await messageAPI.getMessages(conversationId);
      return extractResponseData(res);
    } catch (err: any) {
      return rejectWithValue(normalizeError(err, 'Failed to fetch messages'));
    }
  }
);

// Send a new message
export const sendMessage = createAsyncThunk(
  'messages/sendMessage',
  async (
    { conversationId, content, attachments }: { conversationId: string; content: string; attachments?: File[] },
    { rejectWithValue }
  ) => {
    try {
      const res = await messageAPI.sendMessage(conversationId, { content, attachments });
      return extractResponseData(res);
    } catch (err: any) {
      return rejectWithValue(normalizeError(err, 'Failed to send message'));
    }
  }
);

// Archive a conversation
export const archiveConversation = createAsyncThunk(
  'messages/archiveConversation',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      await messageAPI.archiveConversation(conversationId);
      return conversationId;
    } catch (err: any) {
      return rejectWithValue(normalizeError(err, 'Failed to archive conversation'));
    }
  }
);

const initialState: MessageState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
};

const messageSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    setCurrentConversation: (state, action) => {
      state.currentConversation = action.payload;
    },
    markConversationAsRead: (state, action) => {
      const index = state.conversations.findIndex(c => c._id === action.payload);
      if (index !== -1) {
        state.conversations[index].unreadCount = 0;
      }
    },
    updateTotalUnreadCount: (state, action) => {
      // Assuming you might use this in state, currently we don't have totalUnreadCount in MessageState
    },
    clearMessages: (state) => {
      state.messages = [];
      state.currentConversation = null;
    },
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
    },
    receiveMessage: (state, action) => {
      // Add message to current view if it belongs to the active conversation
      if (state.currentConversation && action.payload.conversation === state.currentConversation._id) {
        state.messages.push(action.payload);
      }
      
      // Update conversation in the list
      const index = state.conversations.findIndex(c => c._id === action.payload.conversation);
      if (index !== -1) {
        state.conversations[index].lastMessage = action.payload;
        state.conversations[index].updatedAt = new Date().toISOString();
        
        // If not the active conversation, increment unread count
        if (!state.currentConversation || state.currentConversation._id !== action.payload.conversation) {
          state.conversations[index].unreadCount = (state.conversations[index].unreadCount || 0) + 1;
        }
        
        // Move to top
        const conv = state.conversations[index];
        state.conversations.splice(index, 1);
        state.conversations.unshift(conv);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Conversations
      .addCase(fetchConversations.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchConversations.fulfilled, (state, action) => {
        state.loading = false;
        state.conversations = action.payload as unknown as Conversation[];
      })
      .addCase(fetchConversations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Create Conversation
      .addCase(createConversation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createConversation.fulfilled, (state, action) => {
        state.loading = false;
        const newConv = action.payload as unknown as Conversation;
        // Check if conversation already exists in state
        const existingIndex = state.conversations.findIndex(c => c._id === newConv._id);
        if (existingIndex !== -1) {
          state.conversations[existingIndex] = newConv;
        } else {
          state.conversations.unshift(newConv);
        }
        state.currentConversation = newConv;
      })
      .addCase(createConversation.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Fetch Messages
      .addCase(fetchMessages.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.loading = false;
        state.messages = action.payload as unknown as Message[];
        
        // Reset unread count for this conversation
        if (state.currentConversation) {
          const index = state.conversations.findIndex(c => c._id === state.currentConversation!._id);
          if (index !== -1) {
            state.conversations[index].unreadCount = 0;
          }
        }
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      // Send Message
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        const newMsg = action.payload as unknown as Message;
        state.messages.push(newMsg);
        
        // Update conversation list
        const index = state.conversations.findIndex(c => c._id === newMsg.conversation);
        if (index !== -1) {
          state.conversations[index].lastMessage = newMsg;
          state.conversations[index].updatedAt = new Date().toISOString();
          
          // Move to top
          const conv = state.conversations[index];
          state.conversations.splice(index, 1);
          state.conversations.unshift(conv);
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload as string;
      })
      
      // Archive Conversation
      .addCase(archiveConversation.fulfilled, (state, action) => {
        state.conversations = state.conversations.filter(c => c._id !== action.payload);
        if (state.currentConversation && state.currentConversation._id === action.payload) {
          state.currentConversation = null;
          state.messages = [];
        }
      });
  },
});

export const { setCurrentConversation, clearMessages, clearCurrentConversation, receiveMessage, markConversationAsRead, updateTotalUnreadCount } = messageSlice.actions;

export default messageSlice.reducer;
