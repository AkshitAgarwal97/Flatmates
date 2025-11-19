import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Property, PropertyFilters, PropertyFormValues, PropertyState } from '../../types';

// Get all properties with filters
export const getProperties = createAsyncThunk(
  'property/getProperties',
  async (filters: PropertyFilters, { rejectWithValue }) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      for (const key of Object.keys(filters) as Array<keyof PropertyFilters>) {
        if (filters[key]) {
          queryParams.append(key, filters[key] as string);
        }
      }

      const res = await axios.get(`/api/properties?${queryParams.toString()}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Get property by ID
export const getPropertyById = createAsyncThunk(
  'property/getPropertyById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/properties/${id}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Create property
export const createProperty = createAsyncThunk(
  'property/createProperty',
  async (propertyData: PropertyFormValues & { images?: File[] }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Handle nested objects and arrays
      for (const key in propertyData) {
        if (key !== 'images') {
          const value = (propertyData as any)[key];
          if (typeof value === 'object' && value !== null) {
            for (const nestedKey in value) {
              formData.append(`${key}[${nestedKey}]`, value[nestedKey]);
            }
          } else {
            formData.append(key, value);
          }
        }
      }
      
      // Append images if they exist
      if (propertyData.images && propertyData.images.length > 0) {
        for (let i = 0; i < propertyData.images.length; i++) {
          formData.append('images', propertyData.images[i]);
        }
      }
      
      const res = await axios.post('/api/properties', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response.data);
    }
  }
);

// Update property
export const updateProperty = createAsyncThunk(
  'property/updateProperty',
  async ({ id, propertyData }: { id: string; propertyData: PropertyFormValues & { images?: File[]; removeImages?: string[] } }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      
      // Handle nested objects and arrays
      for (const key in propertyData) {
        if (key !== 'images' && key !== 'removeImages') {
          const value = (propertyData as any)[key];
          if (typeof value === 'object' && value !== null) {
            for (const nestedKey in value) {
              formData.append(`${key}[${nestedKey}]`, value[nestedKey]);
            }
          } else {
            formData.append(key, value);
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
        formData.append('removeImages', propertyData.removeImages.join(','));
      }
      
      const res = await axios.put(`/api/properties/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return res.data;
    } catch (err) {
      return rejectWithValue((err as any).response.data);
    }
  }
);

// Delete property
export const deleteProperty = createAsyncThunk(
  'property/deleteProperty',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/properties/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue((err as any).response.data);
    }
  }
);

// Save/unsave property
export const toggleSaveProperty = createAsyncThunk(
  'property/toggleSaveProperty',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/properties/${id}/save`);
      return res.data;
    } catch (err) {
      return rejectWithValue((err as any).response.data);
    }
  }
);

// Get user's saved properties
export const getSavedProperties = createAsyncThunk(
  'property/getSavedProperties',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/properties/user/saved');
      return res.data;
    } catch (err) {
      return rejectWithValue((err as any).response.data);
    }
  }
);

// Get user's property listings
export const getUserListings = createAsyncThunk(
  'property/getUserListings',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/properties/user/listings');
      return res.data;
    } catch (err) {
      return rejectWithValue((err as any).response.data);
    }
  }
);

// Property slice
const propertySlice = createSlice({
  name: 'property',
  initialState: {
    properties: [],
    property: null as Property | null,
    savedProperties: [] as Property[],
    userListings: [] as Property[],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pages: 0
    }
  } as PropertyState,
  reducers: {
    clearProperty: (state) => {
      state.property = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setPage: (state, action) => {
      state.pagination.page = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get properties
      .addCase(getProperties.pending, (state) => {
        state.loading = true;
      })
      .addCase(getProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.properties = action.payload.properties;
        state.pagination = action.payload.pagination;
      })
      .addCase(getProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      })
      
      // Get property by ID
      .addCase(getPropertyById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getPropertyById.fulfilled, (state, action) => {
        state.loading = false;
        state.property = action.payload;
      })
      .addCase(getPropertyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      })
      
      // Create property
      .addCase(createProperty.pending, (state) => {
        state.loading = true;
      })
      .addCase(createProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.userListings = [action.payload, ...state.userListings];
      })
      .addCase(createProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      })
      
      // Update property
      .addCase(updateProperty.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.property = action.payload;
        state.userListings = state.userListings.map(property =>
          property._id === action.payload._id ? action.payload : property
        );
      })
      .addCase(updateProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      })
      
      // Delete property
      .addCase(deleteProperty.pending, (state) => {
        state.loading = true;
      })
      .addCase(deleteProperty.fulfilled, (state, action) => {
        state.loading = false;
        state.userListings = state.userListings.filter(
          property => property._id !== action.payload
        );
      })
      .addCase(deleteProperty.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      })
      
      // Toggle save property
      .addCase(toggleSaveProperty.fulfilled, (state, action) => {
        if (action.payload.saved) {
          // Property was saved
          if (state.property) {
            state.savedProperties = [...state.savedProperties, state.property];
          }
        } else {
          // Property was unsaved
          state.savedProperties = state.savedProperties.filter(
            property => !action.payload.savedProperties.includes(property._id)
          );
        }
      })
      
      // Get saved properties
      .addCase(getSavedProperties.pending, (state) => {
        state.loading = true;
      })
      .addCase(getSavedProperties.fulfilled, (state, action) => {
        state.loading = false;
        state.savedProperties = action.payload;
      })
      .addCase(getSavedProperties.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      })
      
      // Get user listings
      .addCase(getUserListings.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserListings.fulfilled, (state, action) => {
        state.loading = false;
        state.userListings = action.payload;
      })
      .addCase(getUserListings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string | null;
      });
  }
});

export const { clearProperty, clearError, setPage } = propertySlice.actions;

export default propertySlice.reducer;