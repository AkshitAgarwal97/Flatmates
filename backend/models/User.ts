import mongoose, { Document, Schema } from 'mongoose';

export interface IUserPreferences {
  location?: string[];
  budget?: {
    min?: number;
    max?: number;
  };
  moveInDate?: Date;
  duration?: string;
  roomType?: string;
  amenities?: string[];
  gender?: string;
  ageRange?: {
    min?: number;
    max?: number;
  };
  lifestyle?: string[];
}

export interface INotification {
  type: 'message' | 'property_update' | 'system';
  content: string;
  relatedTo?: mongoose.Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  avatar?: string;
  socialProvider?: 'local' | 'google' | 'facebook' | 'instagram';
  socialId?: string;
  phone?: string;
  bio?: string;
  preferences?: IUserPreferences;
  savedProperties: mongoose.Types.ObjectId[];
  blockedUsers: mongoose.Types.ObjectId[];
  notifications: INotification[];
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isIdVerified: boolean;
  needsProfileCompletion: boolean;
  lastActive: Date;
  averageResponseTime: number; // In minutes
  isBoosted: boolean;
  boostedUntil?: Date;

  // Roommate specifics
  gender?: 'Male' | 'Female' | 'Other';
  dob?: Date;
  occupation?: 'Student' | 'Professional' | 'WFH' | 'Other';
  personalLifestyle?: {
    food?: 'Veg' | 'Non-Veg' | 'Eggetarian' | 'Vegan';
    smoking?: boolean;
    drinking?: boolean;
    cleanliness?: 'Low' | 'Medium' | 'High';
  };
  isRoommateListed: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String
  },
  avatar: {
    type: String
  },
  socialProvider: {
    type: String,
    enum: ['local', 'google', 'facebook', 'instagram']
  },
  socialId: {
    type: String
  },
  phone: {
    type: String
  },
  bio: {
    type: String
  },
  needsProfileCompletion: {
    type: Boolean,
    default: true
  },
  preferences: {
    location: [String],
    budget: {
      min: Number,
      max: Number
    },
    moveInDate: Date,
    duration: String,
    roomType: String,
    amenities: [String],
    gender: String,
    ageRange: {
      min: Number,
      max: Number
    },
    lifestyle: [String]
  },
  savedProperties: [{
    type: Schema.Types.ObjectId,
    ref: 'Property'
  }],
  blockedUsers: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  notifications: [{
    type: {
      type: String,
      enum: ['message', 'property_update', 'system', 'match']
    },
    content: String,
    relatedTo: Schema.Types.ObjectId,
    read: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  isPhoneVerified: {
    type: Boolean,
    default: false
  },
  isIdVerified: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  averageResponseTime: {
    type: Number,
    default: 0
  },
  isBoosted: {
    type: Boolean,
    default: false
  },
  boostedUntil: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  personalLifestyle: {
    food: { type: String, enum: ['Veg', 'Non-Veg', 'Vegan'] },
    smoking: { type: Boolean, default: false },
    drinking: { type: Boolean, default: false },
    cleanliness: { type: String, enum: ['Low', 'Medium', 'High'] },
  },
  occupation: {
    type: String,
    enum: ['Student', 'Professional', 'WFH', 'Other']
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
  },
  dob: {
    type: Date
  },
  isRoommateListed: {
    type: Boolean,
    default: false
  }
});

// Update the updatedAt field on save
UserSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IUser>('User', UserSchema);