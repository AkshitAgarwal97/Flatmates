import { Schema, Document } from 'mongoose';
export interface IListing extends Document {
    title: string;
    description?: string;
    address: string;
    coordinates: {
        type: 'Point';
        coordinates: [number, number];
    };
    amenities: string[];
    petFriendly: boolean;
    lifestyle: string[];
    availableFrom?: Date;
    owner: Schema.Types.ObjectId;
}
declare const _default: import("mongoose").Model<IListing, {}, {}, {}, Document<unknown, {}, IListing> & IListing & {
    _id: import("mongoose").Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Listing.d.ts.map