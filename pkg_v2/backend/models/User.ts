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
  userType: 'room_seeker' | 'roommate_seeker' | 'broker_dealer' | 'property_owner';
  socialProvider?: 'local' | 'google' | 'facebook' | 'instagram';
  socialId?: string;
  phone?: string;
  bio?: string;
  preferences?: IUserPreferences;
  savedProperties: mongoose.Types.ObjectId[];
  notifications: INotification[];
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
  userType: {
    type: String,
    enum: ['room_seeker', 'roommate_seeker', 'broker_dealer', 'property_owner'],
    required: true
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
  notifications: [{
    type: {
      type: String,
      enum: ['message', 'property_update', 'system']
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
UserSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IUser>('User', UserSchema);