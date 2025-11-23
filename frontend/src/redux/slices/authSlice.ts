import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios, { AxiosError } from 'axios';

// Types
interface User {
  _id: string;
  name: string;
  email: string;
  socialProvider?: string;
  userType?: string;
}

interface ErrorResponse {
  msg?: string;
  message?: string;
  error?: string;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean | null;
  loading: boolean;
  user: User | null;
  error: any | null;
  needsProfileCompletion: boolean;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials extends LoginCredentials {
  name: string;
  userType: string;
}

interface CompleteProfileFormValues {
  phone: string;
  userType: string;
  bio: string;
  preferences: {
    location: string;
    budget: string;
    moveInDate: string;
    duration: string;
    gender: string;
  };
}

interface AuthResponse {
  token: string;
  user?: User;
}

// Helper function to set auth token
const setAuthToken = (token: string | null) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Async thunks
export const loadUser = createAsyncThunk(
  'auth/loadUser',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return rejectWithValue('No token found');

      setAuthToken(token);
      const res = await axios.get<User>('/api/auth/user');
      return res.data;
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      localStorage.removeItem('token');
      setAuthToken(null);
      return rejectWithValue(err.response?.data?.msg ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Server Error');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData: RegisterCredentials, { rejectWithValue }) => {
    try {
      const res = await axios.post<AuthResponse>('/api/auth/register', userData);
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      return res.data;
    } catch (error) {
      const err = error as AxiosError<ErrorResponse>;
      return rejectWithValue(err.response?.data?.msg ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (userData: LoginCredentials, { rejectWithValue }) => {
    try {
      const res = await axios.post<AuthResponse>('/api/auth/login', userData);
      localStorage.setItem('token', res.data.token);
      setAuthToken(res.data.token);
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Login failed');
    }
  }
);

export const completeProfile = createAsyncThunk(
  'auth/completeProfile',
  async (profileData: CompleteProfileFormValues, { rejectWithValue }) => {
    try {
      const res = await axios.put<User>('/api/auth/complete-profile', profileData);
      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Profile completion failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: Partial<CompleteProfileFormValues> & { avatar?: File }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      Object.entries(profileData).forEach(([key, value]) => {
        if (key !== 'avatar' && key !== 'preferences') {
          formData.append(key, value as string);
        }
      });

      if (profileData.preferences) {
        Object.entries(profileData.preferences).forEach(([key, value]) => {
          formData.append(`preferences[${key}]`, value);
        });
      }

      if (profileData.avatar instanceof File) {
        formData.append('avatar', profileData.avatar);
      }

      const res = await axios.put<User>('/api/users/me', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      return res.data;
    } catch (error) {
      const err = error as AxiosError;
      return rejectWithValue(err.response?.data || 'Profile update failed');
    }
  }
);

// Create slice
const initialState: AuthState = {
  token: localStorage.getItem('token'),
  isAuthenticated: null,
  loading: true,
  user: null,
  error: null,
  needsProfileCompletion: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      setAuthToken(null);
      state.token = null;
      state.isAuthenticated = false;
      state.user = null;
      state.loading = false;
    },
    clearError: (state) => {
      state.error = null;
    },
    setToken: (state, action: PayloadAction<string>) => {
      localStorage.setItem('token', action.payload);
      setAuthToken(action.payload);
      state.token = action.payload;
      state.isAuthenticated = true;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadUser.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload;
        state.needsProfileCompletion = !!(
          state.user?.socialProvider &&
          state.user.socialProvider !== 'local' &&
          (!state.user.userType || state.user.userType === 'room_seeker')
        );
      })
      .addCase(loadUser.rejected, (state, action) => {
        Object.assign(state, initialState, { loading: false, error: action.payload });
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload.user || null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.loading = false;
        state.user = action.payload.user || null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.token = null;
        state.user = null;
      })
      .addCase(completeProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(completeProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.needsProfileCompletion = false;
      })
      .addCase(completeProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearError, setToken } = authSlice.actions;
export default authSlice.reducer;
