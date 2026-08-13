import axios, { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL ? `${process.env.REACT_APP_API_URL}/api` : '/api'
});

// Normalize backend response wrapper
export const extractResponseData = <T>(response: AxiosResponse<T>) => {
  const data: any = response.data;
  return data && data.success !== undefined ? data.data : data;
};

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Response interceptor for handling errors
api.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized errors — only clear the token.
    // DO NOT use window.location.href here: it causes a full page reload loop
    // because loadUser() fires on every mount, gets a 401, which reloads the page,
    // which fires loadUser() again, ad infinitum.
    // PrivateRoute already handles the /login redirect via React Router.
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  completeProfile: (profileData: any) => api.put('/auth/complete-profile', profileData),
  getMe: () => api.get('/auth/user'),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  verifyOtp: (email: string, otp: string) => api.post('/auth/verify-otp', { email, otp }),
  resetPassword: (data: any) => api.post('/auth/reset-password', data)
};

const appendFormData = (formData: FormData, data: Record<string, any>, jsonKeys: string[] = []) => {
  for (const key in data) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) continue;
    const value = data[key];
    if (value === undefined || value === null) continue;

    if (jsonKeys.includes(key) || Array.isArray(value)) {
      formData.append(key, JSON.stringify(value));
    } else if (typeof value === 'boolean') {
      // Booleans must be explicitly converted to strings for FormData
      formData.append(key, value.toString());
    } else {
      formData.append(key, value);
    }
  }
};

// Property API
export const propertyAPI = {
  getProperties: (filters?: any) => api.get('/properties', { params: filters }),
  getPropertyById: (id: string) => api.get(`/properties/${id}`),
  createProperty: (propertyData: any) => {
    const formData = new FormData();
    appendFormData(formData, propertyData, ['address', 'price', 'availability', 'features', 'currentOccupants', 'preferences']);

    if (propertyData.images && propertyData.images.length > 0) {
      for (let i = 0; i < propertyData.images.length; i++) {
        formData.append('images', propertyData.images[i]);
      }
    }

    return api.post('/properties', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  updateProperty: (id: string, propertyData: any) => {
    const formData = new FormData();
    appendFormData(formData, propertyData, ['address', 'price', 'availability', 'features', 'currentOccupants', 'preferences']);

    if (propertyData.images && propertyData.images.length > 0) {
      for (let i = 0; i < propertyData.images.length; i++) {
        formData.append('images', propertyData.images[i]);
      }
    }

    if (propertyData.removeImages && propertyData.removeImages.length > 0) {
      formData.append('removeImages', Array.isArray(propertyData.removeImages) ? propertyData.removeImages.join(',') : propertyData.removeImages);
    }

    return api.put(`/properties/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  deleteProperty: (id: string) => api.delete(`/properties/${id}`),
  toggleSaveProperty: (id: string) => api.post(`/properties/${id}/save`),
  getSavedProperties: () => api.get('/properties/user/saved'),
  getUserListings: () => api.get('/properties/user/listings')
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (profileData: any) => {
    const formData = new FormData();
    const profilePayload = { ...profileData };
    delete profilePayload.avatar;
    appendFormData(formData, profilePayload, ['preferences', 'personalLifestyle']);

    if (profileData.avatar && profileData.avatar instanceof File) {
      formData.append('avatar', profileData.avatar);
    }

    return api.put('/users/me', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  getUserById: (id: string) => api.get(`/users/${id}`),
  getUsers: (filters?: any) => api.get('/users', { params: filters }),
  getNotifications: () => api.get('/users/me/notifications'),
  markNotificationAsRead: (id: string) => api.put(`/users/notifications/${id}`)
};

// Report API (user reports)
// Note: returns AxiosResponse — caller may use extractResponseData
(userAPI as any).reportUser = (payload: any) => api.post('/users/report', payload);

// Service API (marketplace)
export const serviceAPI = {
  getServices: (type?: string) => {
    const params = type && type !== 'all' ? { type } : undefined;
    return api.get('/services', { params });
  }
};

// Message API
export const messageAPI = {
  getConversations: () => api.get('/messages/conversations'),
  createConversation: (data: any) => api.post('/messages/conversations', data),
  getMessages: (conversationId: string) => api.get(`/messages/conversations/${conversationId}`),
  sendMessage: (conversationId: string, messageData: any) => {
    const formData = new FormData();
    formData.append('content', messageData.content);

    if (messageData.attachments && messageData.attachments.length > 0) {
      for (let i = 0; i < messageData.attachments.length; i++) {
        formData.append('attachments', messageData.attachments[i]);
      }
    }

    return api.post(`/messages/conversations/${conversationId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  archiveConversation: (conversationId: string) => api.delete(`/messages/conversations/${conversationId}`)
};

// Roommate API
export const roommateAPI = {
  searchRoommates: (filters?: any) => api.get('/roommates', { params: filters })
};

export default api;