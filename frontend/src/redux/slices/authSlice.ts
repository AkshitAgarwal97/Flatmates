import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, userAPI, propertyAPI, extractResponseData } from '../../services/api';
import { User, AuthState, LoginCredentials, RegisterData, AuthResponse } from '../../types';

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

// Set auth token - Keep for backwards compatibility if components call it directly
// The actual headers are handled by the axios interceptor in api.ts
export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

// Load user
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const res = await authAPI.getMe();
      return extractResponseData(res);
    } catch (err: any) {
      return rejectWithValue(normalizeError(err, 'Failed to load user'));
    }
  }
);

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      const res = await authAPI.register(userData);
      return extractResponseData(res);
    } catch (err: any) {
      return rejectWithValue(normalizeError(err, 'Failed to register'));
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (userData: LoginCredentials, { rejectWithValue }) => {
    try {
      const res = await authAPI.login(userData);
      return extractResponseData(res);
    } catch (err: any) {
      return rejectWithValue(normalizeError(err, 'Failed to login'));
    }
  }
);

// Complete profile
export const completeProfile = createAsyncThunk(
  'auth/completeProfile',
  async (profileData: any, { rejectWithValue }) => {
    try {
      const res = await authAPI.completeProfile(profileData);
      return extractResponseData(res);
    } catch (err: any) {
      return rejectWithValue(normalizeError(err, 'Failed to complete profile'));
    }
  }
);

// Update user profile
export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: any, { rejectWithValue }) => {
    try {
      const res = await userAPI.updateProfile(profileData);
      return extractResponseData(res);
    } catch (err: any) {
      return rejectWithValue(normalizeError(err, 'Failed to update profile'));
    }
  }
);

// Toggle save property (dispatched from auth to update user's savedProperties array)
export const toggleSaveProperty = createAsyncThunk(
  'auth/toggleSaveProperty',
  async (propertyId: string, { rejectWithValue }) => {
    try {
      const res = await propertyAPI.toggleSaveProperty(propertyId);
      return extractResponseData(res).savedProperties;
    } catch (err: any) {
      return rejectWithValue(normalizeError(err, 'Failed to save property'));
    }
  }
);

const initialState: AuthState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true,
  user: null,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.token = action.payload;
    },
    logout: (state) => {
      setAuthToken(null);
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.user = null;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    addNotification: (state, action) => {
      if (state.user) {
        if (!state.user.notifications) {
          state.user.notifications = [];
        }
        state.user.notifications.unshift(action.payload);
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Load user
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload as User;
      })
      .addCase(loadUser.rejected, (state, action) => {
        setAuthToken(null);
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        // Don't set error for loadUser as it's called on every page load
      })

      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        const payload = action.payload as AuthResponse;
        setAuthToken(payload.token);
        state.token = payload.token;
        state.isAuthenticated = true;
        state.loading = false;
        state.user = payload.user;
      })
      .addCase(register.rejected, (state, action) => {
        setAuthToken(null);
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error = action.payload as string;
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        const payload = action.payload as AuthResponse;
        setAuthToken(payload.token);
        state.token = payload.token;
        state.isAuthenticated = true;
        state.loading = false;
        state.user = payload.user;
      })
      .addCase(login.rejected, (state, action) => {
        setAuthToken(null);
        state.token = null;
        state.isAuthenticated = false;
        state.loading = false;
        state.user = null;
        state.error = action.payload as string;
      })

      // Complete profile
      .addCase(completeProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload as User;
      })
      .addCase(completeProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload as User;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Toggle save property
      .addCase(toggleSaveProperty.fulfilled, (state, action) => {
        if (state.user) {
          state.user.savedProperties = action.payload;
        }
      });
  }
});

export const { setToken, logout, clearError, addNotification } = authSlice.actions;

export default authSlice.reducer;
