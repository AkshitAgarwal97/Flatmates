import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { propertyAPI, extractResponseData } from '../../services/api';
import { Property, PropertyFilters, PropertyFormValues, PropertyState } from '../../types';

// Get all properties with filters
export const getProperties = createAsyncThunk(
  'property/getProperties',
  async (filters: PropertyFilters, { rejectWithValue }) => {
    try {
      // Build query string from filters
      const queryParams: Record<string, string> = {};
      for (const key of Object.keys(filters) as Array<keyof PropertyFilters>) {
        if (filters[key]) {
          queryParams[key] = filters[key] as string;
        }
      }

      const res = await propertyAPI.getProperties(queryParams);
      // Backend returns either { data: ... } or just the raw JSON.
      // We check if res.data.success is true, meaning we are using the new apiResponse format.
      return extractResponseData(res);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch properties');
    }
  }
);

// Get property by ID
export const getPropertyById = createAsyncThunk(
  'property/getPropertyById',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await propertyAPI.getPropertyById(id);
      return extractResponseData(res);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch property');
    }
  }
);

// Create property
export const createProperty = createAsyncThunk(
  'property/createProperty',
  async (propertyData: PropertyFormValues & { images?: File[] }, { rejectWithValue }) => {
    try {
      const res = await propertyAPI.createProperty(propertyData);
      return extractResponseData(res);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to create property');
    }
  }
);

// Update property
export const updateProperty = createAsyncThunk(
  'property/updateProperty',
  async ({ id, propertyData }: { id: string; propertyData: PropertyFormValues & { images?: File[]; removeImages?: string[] } }, { rejectWithValue }) => {
    try {
      const res = await propertyAPI.updateProperty(id, propertyData);
      return extractResponseData(res);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to update property');
    }
  }
);

// Delete property
export const deleteProperty = createAsyncThunk(
  'property/deleteProperty',
  async (id: string, { rejectWithValue }) => {
    try {
      await propertyAPI.deleteProperty(id);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to delete property');
    }
  }
);

// Save/unsave property
export const toggleSaveProperty = createAsyncThunk(
  'property/toggleSaveProperty',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await propertyAPI.toggleSaveProperty(id);
      return extractResponseData(res);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to toggle save property');
    }
  }
);

// Get user's saved properties
export const getSavedProperties = createAsyncThunk(
  'property/getSavedProperties',
  async (_, { rejectWithValue }) => {
    try {
      const res = await propertyAPI.getSavedProperties();
      return extractResponseData(res);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch saved properties');
    }
  }
);

// Get user's property listings
export const getUserListings = createAsyncThunk(
  'property/getUserListings',
  async (_, { rejectWithValue }) => {
    try {
      const res = await propertyAPI.getUserListings();
      return extractResponseData(res);
    } catch (err: any) {
      return rejectWithValue(err.response?.data || 'Failed to fetch user listings');
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
            state.property = { ...state.property, isSaved: true } as any;
            state.savedProperties = [...state.savedProperties, state.property as any];
          }
        } else {
          // Property was unsaved
          if (state.property) {
            state.property = { ...state.property, isSaved: false } as any;
          }
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
      })
      .addMatcher(
        (action) => action.type === 'auth/toggleSaveProperty/fulfilled',
        (state, action: any) => {
          const savedIds = action.payload as string[];
          if (state.property) {
            state.property = { ...state.property, isSaved: savedIds.includes(state.property._id) } as any;
          }
          state.savedProperties = state.savedProperties.filter(
            p => savedIds.includes(p._id)
          );
        }
      );
  }
});

export const { clearProperty, clearError, setPage } = propertySlice.actions;

export default propertySlice.reducer;
