import mongoose, { Document } from 'mongoose';
export interface IService extends Document {
    name: string;
    type: 'movers' | 'cleaning' | 'furniture_rental' | 'internet' | 'other';
    description: string;
    priceRange: string;
    contactInfo: {
        phone?: string;
        email?: string;
        website?: string;
    };
    rating: number;
    logo?: string;
    isPromoted: boolean;
    city: string[];
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IService, {}, {}, {}, mongoose.Document<unknown, {}, IService> & IService & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Service.d.ts.map