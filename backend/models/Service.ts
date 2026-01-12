import mongoose, { Document, Schema } from 'mongoose';

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

const ServiceSchema: Schema = new Schema({
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['movers', 'cleaning', 'furniture_rental', 'internet', 'other'],
        required: true
    },
    description: {
        type: String,
        required: true
    },
    priceRange: String,
    contactInfo: {
        phone: String,
        email: String,
        website: String
    },
    rating: {
        type: Number,
        default: 0
    },
    logo: String,
    isPromoted: {
        type: Boolean,
        default: false
    },
    city: [String],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IService>('Service', ServiceSchema);
