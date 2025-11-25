import mongoose, { Document } from 'mongoose';
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
    brokerage?: number;
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
    propertyType: 'room' | 'flat' | 'house' | 'studio' | 'apartment';
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
declare const _default: mongoose.Model<IProperty, {}, {}, {}, mongoose.Document<unknown, {}, IProperty> & IProperty & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Property.d.ts.map