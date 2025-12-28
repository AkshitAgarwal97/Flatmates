"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ListingSchema = new mongoose_1.Schema({
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
    owner: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });
// Indexes for fast geo & filter queries
ListingSchema.index({ coordinates: '2dsphere' });
ListingSchema.index({ petFriendly: 1 });
ListingSchema.index({ lifestyle: 1 });
ListingSchema.index({ amenities: 1 });
ListingSchema.index({ availableFrom: 1 });
exports.default = (0, mongoose_1.model)('Listing', ListingSchema);
//# sourceMappingURL=Listing.js.map