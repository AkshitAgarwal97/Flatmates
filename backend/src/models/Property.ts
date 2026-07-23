import mongoose, { Document, Schema } from 'mongoose';

export interface IPropertyAddress {
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

export interface IPropertyPrice {
  amount: number;
  brokerage?: number; // brokerage amount charged by broker/dealer (optional)
}

export interface IPropertyAvailability {
  availableFrom: Date;
  availableUntil?: Date;
  minimumStay?: number;
  maximumStay?: number;
}

export interface IPropertyFeatures {
  bedrooms?: number;
  bathrooms?: number;
  area?: number;
  furnishing?: 'furnished' | 'unfurnished' | 'semi-furnished';
  amenities?: string[];
  utilities?: string[];
}

export interface IPropertyOccupant {
  gender: 'male' | 'female' | 'other';
  age?: number;
  occupation?: string;
}

export interface IPropertyCurrentOccupants {
  total: number;
  details: IPropertyOccupant[];
}

export interface IPropertyPreferences {
  gender?: 'male' | 'female' | 'any';
  ageRange?: {
    min?: number;
    max?: number;
  };
  occupation?: string[];
  lifestyle?: string[];
  smoking?: boolean;
  pets?: boolean;
}

export interface IPropertyImage {
  url: string;
  caption?: string;
}

export interface IProperty extends Document {
  owner: mongoose.Types.ObjectId;
  title: string;
  description: string;
  propertyType: 'room' | 'flat' | 'house' | 'studio' | 'apartment';
  listingType: 'room_in_flat' | 'roommates_for_flat' | 'occupied_flat' | 'entire_property';
  address: IPropertyAddress;
  price: IPropertyPrice;
  availability: IPropertyAvailability;
  features: IPropertyFeatures;
  images: IPropertyImage[];
  currentOccupants: IPropertyCurrentOccupants;
  preferences: IPropertyPreferences;
  status: 'active' | 'inactive' | 'rented';
  views: number;
  saves: number;
  isFeatured: boolean;
  featuredUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PropertySchema: Schema = new Schema({
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  propertyType: {
    type: String,
    enum: ['room', 'flat', 'house', 'studio', 'apartment'],
    required: true
  },
  listingType: {
    type: String,
    enum: ['room_in_flat', 'roommates_for_flat', 'occupied_flat', 'entire_property'],
    required: true
  },
  address: {
    street: String,
    city: {
      type: String,
      required: true
    },
    state: String,
    country: {
      type: String,
      required: true
    },
    zipCode: String,
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      default: [0, 0]
    }
  },
  price: {
    amount: {
      type: Number,
      required: true
    },
    // Removed currency & period fields per new requirements
    brokerage: {
      type: Number,
      default: 0
    }
  },
  availability: {
    availableFrom: {
      type: Date,
      required: true
    },
    availableUntil: Date,
    minimumStay: Number,
    maximumStay: Number
  },
  features: {
    bedrooms: Number,
    bathrooms: Number,
    area: Number,
    furnishing: {
      type: String,
      enum: ['furnished', 'unfurnished', 'semi-furnished']
    },
    amenities: [String],
    utilities: [String]
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    caption: String
  }],
  currentOccupants: {
    total: {
      type: Number,
      default: 0
    },
    details: [{
      gender: {
        type: String,
        enum: ['male', 'female', 'other']
      },
      age: Number,
      occupation: String
    }]
  },
  preferences: {
    gender: {
      type: String,
      enum: ['male', 'female', 'any']
    },
    ageRange: {
      min: Number,
      max: Number
    },
    occupation: [String],
    lifestyle: [String],
    smoking: Boolean,
    pets: Boolean
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'rented'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0
  },
  saves: {
    type: Number,
    default: 0
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  featuredUntil: {
    type: Date
  },
}, {
  timestamps: true  // Auto-manages createdAt and updatedAt (also works with findByIdAndUpdate)
});

// Text index for full-text search on title and description
PropertySchema.index({ title: 'text', description: 'text' });

// 2dsphere index for location radius search
PropertySchema.index({ location: '2dsphere' });

// Compound index: primary listing browse query (city filter + active + sorted by price)
PropertySchema.index({ 'address.city': 1, status: 1, 'price.amount': 1 });

// Compound index: expiry background job + general active listing listing
PropertySchema.index({ status: 1, createdAt: -1 });

// Compound index: my listings page (owner filter)
PropertySchema.index({ owner: 1, status: 1, createdAt: -1 });

// Featured listings query
PropertySchema.index({ isFeatured: 1, status: 1, featuredUntil: 1 });

// Price range filter
PropertySchema.index({ 'price.amount': 1, status: 1 });

// Gender preference filter
PropertySchema.index({ 'preferences.gender': 1, status: 1 });



export default mongoose.model<IProperty>('Property', PropertySchema);