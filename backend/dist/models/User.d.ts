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
    userType: 'room_seeker' | 'roommate_seeker' | 'room_provider' | 'property_owner';
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
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser> & IUser & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=User.d.ts.map