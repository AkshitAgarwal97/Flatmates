// Shared type definitions for the entire application

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  preferences?: Preferences;
  createdAt: string;
  updatedAt: string;
}

export interface Preferences {
  budget?: Price;
  location?: Address;
  propertyType?: string;
  moveInDate?: string;
  leaseDuration?: string;
  amenities?: string[];
  gender?: string;
  occupation?: string;
  lifestyle?: string;
  ageRange?: string;
}

export interface Price {
  // For listings
  amount?: number;
  brokerage?: number;
  // For filters/preferences
  min?: number;
  max?: number;
}

export interface Address {
  street?: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface Property {
  _id: string;
  title: string;
  description: string;
  price: Price;
  address: Address;
  propertyType: string;
  userType?: string;
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  size?: number;
  amenities: string[];
  rules?: string[];
  preferences?: Preferences;
  images: Array<{ url: string; caption?: string }>;
  availableFrom: string;
  leaseDuration?: string;
  availabilityDate?: string;
  createdBy?: User;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  savedBy?: string[];
}

export interface Message {
  _id: string;
  conversationId: string;
  sender: User;
  receiver: User;
  content: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Conversation {
  _id: string;
  participants: (User | string)[];
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface PropertyFilters {
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  propertyType?: string;
  bedrooms?: number;
  bathrooms?: number;
  page?: number;
  limit?: number;
  userOnly?: boolean;
}

// Form types
export interface PropertyFormValues {
  title: string;
  description: string;
  price: { amount: number; currency: string; period: string };
  address: Address;
  propertyType: string;
  userType?: string;
  bedrooms: number;
  bathrooms: number;
  area?: number;
  size?: number;
  amenities: string[];
  rules?: string[];
  preferences?: Preferences;
  availableFrom: string;
  leaseDuration?: string;
  images?: File[];
}

// Redux state types
export interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
}

export interface PropertyState {
  properties: Property[];
  property: Property | null;
  savedProperties: Property[];
  userListings: Property[];
  loading: boolean;
  error: string | null;
  pagination: Pagination;
}

export interface MessageState {
  conversations: Conversation[];
  messages: Message[];
  currentConversation: Conversation | null;
  loading: boolean;
  error: string | null;
}

export interface AlertState {
  type: 'success' | 'error' | 'warning' | 'info' | null;
  message: string | null;
  open: boolean;
}

// API error type
export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string>;
}