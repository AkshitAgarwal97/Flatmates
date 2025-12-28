import { Schema, model, Document } from 'mongoose';

export interface IListing extends Document {
    title: string;
    description?: string;
    address: string;
    coordinates: { type: 'Point'; coordinates: [number, number] }; // GeoJSON lon,lat
    amenities: string[];            // e.g. ['wifi','parking']
    petFriendly: boolean;
    lifestyle: string[];            // e.g. ['student','professional']
    availableFrom?: Date;
    owner: Schema.Types.ObjectId;
    // …other existing fields
}

const ListingSchema = new Schema<IListing>({
    title: { type: String, required: true },
    description: { type: String },
    address: { type: String, required: true },
    coordinates: {
        type: { type: String, enum: ['Point'], required: true, default: 'Point' },
        coordinates: { type: [Number], required: true }, // [lon, lat]
    },
    amenities: [{ type: String }],
    petFriendly: { type: Boolean, default: false },
    lifestyle: [{ type: String }],
    availableFrom: { type: Date },
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

// Indexes for fast geo & filter queries
ListingSchema.index({ coordinates: '2dsphere' });
ListingSchema.index({ petFriendly: 1 });
ListingSchema.index({ lifestyle: 1 });
ListingSchema.index({ amenities: 1 });
ListingSchema.index({ availableFrom: 1 });

export default model<IListing>('Listing', ListingSchema);
