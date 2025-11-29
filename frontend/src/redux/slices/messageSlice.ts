import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';

// Types
interface Message {
  _id: string;
  content: string;
  sender: string;
  conversation: string;
  attachments?: string[];
  createdAt: string;
}

interface Conversation {
  _id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
}

interface MessageState {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  error: any | null;
  unreadCount: number;
}

interface SendMessagePayload {
  conversationId: string;
  content: string;
  attachments?: File[];
}

interface MessageResponse {
  message: Message;
}

interface ConversationsResponse {
  conversations: Conversation[];
}

interface ConversationMessagesResponse {
  conversation: Conversation;
  messages: Message[];
}

// Async thunks
export const getConversations = createAsyncThunk(
  'message/getConversations',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get<ConversationsResponse>('/api/messages/conversations');
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Failed to fetch conversations');
    }
  }
);

export const createConversation = createAsyncThunk(
  'message/createConversation',
  async (formData: { recipient: string; initialMessage?: string; property?: string }, { rejectWithValue }) => {
    try {
      const res = await axios.post<Conversation>('/api/messages/conversations', formData);
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Failed to create conversation');
    }
  }
);

export const getMessages = createAsyncThunk(
  'message/getMessages',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      const res = await axios.get<ConversationMessagesResponse>(`/api/messages/conversations/${conversationId}`);
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Failed to fetch messages');
    }
  }
);

export const sendMessage = createAsyncThunk(
  'message/sendMessage',
  async ({ conversationId, content, attachments }: SendMessagePayload, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append('content', content);

      if (attachments && attachments.length > 0) {
        attachments.forEach(file => {
          formData.append('attachments', file);
        });
      }

      const res = await axios.post<MessageResponse>(
        `/api/messages/conversations/${conversationId}`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Failed to send message');
    }
  }
);

export const archiveConversation = createAsyncThunk(
  'message/archiveConversation',
  async (conversationId: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/messages/conversations/${conversationId}`);
      return conversationId;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Failed to archive conversation');
    }
  }
);

// Initial state
const initialState: MessageState = {
  conversations: [],
  currentConversation: null,
  messages: [],
  loading: false,
  error: null,
  unreadCount: 0
};

// Message slice
const messageSlice = createSlice({
  name: 'message',
  initialState,
  reducers: {
    clearCurrentConversation: (state) => {
      state.currentConversation = null;
      state.messages = [];
    },
    clearError: (state) => {
      state.error = null;
    },
    receiveMessage: (state, action: PayloadAction<{ message: Message; conversationId: string }>) => {
      const { message, conversationId } = action.payload;

      if (state.currentConversation?._id === conversationId) {
        state.messages.push(message);
      }

      const conversationIndex = state.conversations.findIndex(
        conv => conv._id === conversationId
      );

      if (conversationIndex !== -1) {
        const updatedConversation = {
          ...state.conversations[conversationIndex],
          lastMessage: message,
          unreadCount: state.currentConversation?._id === conversationId
            ? 0
            : (state.conversations[conversationIndex].unreadCount + 1)
        };

        const updatedConversations = state.conversations.filter(
          conv => conv._id !== conversationId
        );

        state.conversations = [updatedConversation, ...updatedConversations];

        if (state.currentConversation?._id !== conversationId) {
          state.unreadCount += 1;
        }
      }
    },
    markConversationAsRead: (state, action: PayloadAction<string>) => {
      const conversationIndex = state.conversations.findIndex(
        conv => conv._id === action.payload
      );

      if (conversationIndex !== -1) {
        state.unreadCount -= state.conversations[conversationIndex].unreadCount;
        state.conversations[conversationIndex].unreadCount = 0;
      }
    },
    updateTotalUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    }
  },
  extraReducers: (builder) => {
    // Get conversations
    builder.addCase(getConversations.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getConversations.fulfilled, (state, action) => {
      state.loading = false;
      state.conversations = action.payload as any;
    });
    builder.addCase(getConversations.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Create conversation
    builder.addCase(createConversation.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(createConversation.fulfilled, (state, action) => {
      state.loading = false;
      // Check if conversation already exists to avoid duplicates
      const exists = state.conversations.some(c => c._id === action.payload._id);
      if (!exists) {
        state.conversations.unshift(action.payload);
      }
    });
    builder.addCase(createConversation.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Get messages
    builder.addCase(getMessages.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(getMessages.fulfilled, (state, action) => {
      state.loading = false;
      state.messages = action.payload as any;
    });
    builder.addCase(getMessages.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Send message
    builder.addCase(sendMessage.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(sendMessage.fulfilled, (state, action) => {
      state.loading = false;
      state.messages.push(action.payload as any);
    });
    builder.addCase(sendMessage.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Archive conversation
    builder.addCase(archiveConversation.fulfilled, (state, action) => {
      state.conversations = state.conversations.filter(
        conv => conv._id !== action.payload
      );
    });
  }
});

export const {
  clearCurrentConversation,
  clearError,
  receiveMessage,
  markConversationAsRead,
  updateTotalUnreadCount
} = messageSlice.actions;

export default messageSlice.reducer;