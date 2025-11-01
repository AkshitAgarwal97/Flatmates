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
  propertyType: 'room' | 'flat' | 'house' | 'studio';
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
    enum: ['room', 'flat', 'house', 'studio'],
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
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
PropertySchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IProperty>('Property', PropertySchema);