import mongoose, { Document } from 'mongoose';
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
    averageResponseTime: number;
    isBoosted: boolean;
    boostedUntil?: Date;
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
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map