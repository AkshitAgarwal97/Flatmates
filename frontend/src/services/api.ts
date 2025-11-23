import axios, { AxiosResponse, AxiosError } from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: '/api'
});

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
    // Handle 401 Unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (userData: any) => api.post('/auth/register', userData),
  login: (credentials: any) => api.post('/auth/login', credentials),
  completeProfile: (profileData: any) => api.put('/auth/complete-profile', profileData),
  getMe: () => api.get('/auth/user')
};

// Property API
export const propertyAPI = {
  getProperties: (filters?: any) => api.get('/properties', { params: filters }),
  getPropertyById: (id: string) => api.get(`/properties/${id}`),
  createProperty: (propertyData: any) => {
    const formData = new FormData();
    
    // Handle nested objects and arrays
    for (const key in propertyData) {
      if (key !== 'images') {
        if (typeof propertyData[key] === 'object' && propertyData[key] !== null) {
          for (const nestedKey in propertyData[key]) {
            formData.append(`${key}[${nestedKey}]`, propertyData[key][nestedKey]);
          }
        } else {
          formData.append(key, propertyData[key]);
        }
      }
    }
    
    // Append images if they exist
    if (propertyData.images && propertyData.images.length > 0) {
      for (let i = 0; i < propertyData.images.length; i++) {
        formData.append('images', propertyData.images[i]);
      }
    }
    
    return api.post('/properties', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },
  updateProperty: (id: string, propertyData: any) => {
    const formData = new FormData();
    
    // Handle nested objects and arrays
    for (const key in propertyData) {
      if (key !== 'images' && key !== 'removeImages') {
        if (typeof propertyData[key] === 'object' && propertyData[key] !== null) {
          for (const nestedKey in propertyData[key]) {
            formData.append(`${key}[${nestedKey}]`, propertyData[key][nestedKey]);
          }
        } else {
          formData.append(key, propertyData[key]);
        }
      }
    }
    
    // Append images if they exist
    if (propertyData.images && propertyData.images.length > 0) {
      for (let i = 0; i < propertyData.images.length; i++) {
        formData.append('images', propertyData.images[i]);
      }
    }
    
    // Add removeImages if specified
    if (propertyData.removeImages) {
      formData.append('removeImages', propertyData.removeImages);
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
    
    for (const key in profileData) {
      if (key !== 'avatar') {
        if (typeof profileData[key] === 'object' && profileData[key] !== null) {
          formData.append(key, JSON.stringify(profileData[key]));
        } else {
          formData.append(key, profileData[key]);
        }
      }
    }
    
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

export default api;