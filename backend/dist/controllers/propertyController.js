"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleSaveProperty = exports.deleteProperty = exports.updateProperty = exports.getPropertyById = exports.getUserListings = exports.getSavedProperties = exports.getProperties = exports.createProperty = void 0;
const express_validator_1 = require("express-validator");
const Property_1 = __importDefault(require("../models/Property"));
const User_1 = __importDefault(require("../models/User"));
const emailService_1 = __importDefault(require("../services/emailService"));
const notificationService_1 = __importDefault(require("../services/notificationService"));
const uploadService_1 = require("../services/uploadService");
const formDataHelper_1 = require("../utils/formDataHelper");
const cache_1 = __importDefault(require("../utils/cache"));
const matchScore_1 = require("../utils/matchScore");
const apiResponse_1 = require("../utils/apiResponse");
const createProperty = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return (0, apiResponse_1.validationError)(res, errors.array());
    }
    try {
        // Process uploaded images
        const images = [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const uploadPromises = req.files.map(async (file) => {
                const result = await (0, uploadService_1.uploadToCloudinary)(file.buffer, 'flatmates/properties');
                return { url: result.url, caption: '' };
            });
            try {
                const settled = await Promise.all(uploadPromises);
                images.push(...settled);
            }
            catch (error) {
                console.error('Cloudinary upload error:', error);
                return (0, apiResponse_1.error)(res, `Image upload failed: ${error.message || 'Unknown error'}`);
            }
        }
        // Parse nested objects from FormData
        const parsedPreferences = (0, formDataHelper_1.parseFormDataJSON)(req.body.preferences) || {};
        const filteredPreferences = {};
        // Only include non-empty preference values
        if (parsedPreferences.gender && parsedPreferences.gender !== '') {
            filteredPreferences.gender = parsedPreferences.gender;
        }
        if (parsedPreferences.occupation && parsedPreferences.occupation !== '') {
            filteredPreferences.occupation = parsedPreferences.occupation;
        }
        const parsedAddress = (0, formDataHelper_1.parseFormDataJSON)(req.body.address);
        const locationData = (parsedAddress && parsedAddress.coordinates && parsedAddress.coordinates.lat && parsedAddress.coordinates.lng)
            ? { type: 'Point', coordinates: [Number(parsedAddress.coordinates.lng), Number(parsedAddress.coordinates.lat)] }
            : undefined;
        // Create new property
        const newProperty = new Property_1.default({
            owner: req.user?.id,
            title: req.body.title,
            description: req.body.description,
            propertyType: req.body.propertyType,
            listingType: req.body.listingType,
            address: parsedAddress,
            ...(locationData ? { location: locationData } : {}),
            price: (0, formDataHelper_1.parseFormDataJSON)(req.body.price),
            availability: (0, formDataHelper_1.parseFormDataJSON)(req.body.availability),
            features: (0, formDataHelper_1.parseFormDataJSON)(req.body.features) || {},
            images,
            currentOccupants: (0, formDataHelper_1.parseFormDataJSON)(req.body.currentOccupants) || { total: 0, details: [] },
            preferences: filteredPreferences
        });
        const property = await newProperty.save();
        cache_1.default.invalidatePrefix('properties:'); // Bust listing cache
        // Notify potential matches in the background
        (async () => {
            try {
                const matchingUsers = await User_1.default.find({
                    _id: { $ne: req.user?.id },
                    'preferences.location': property.address.city,
                    'preferences.budget.max': { $gte: property.price.amount },
                    'preferences.budget.min': { $lte: property.price.amount }
                }).limit(50);
                if (matchingUsers.length > 0) {
                    await notificationService_1.default.notifyUsers(matchingUsers.map(u => u._id), {
                        type: 'match',
                        content: `New match in ${property.address.city}: ${property.title}`,
                        relatedTo: property._id,
                        relatedModel: 'Property'
                    });
                }
            }
            catch (err) {
                console.error('Match notify error:', err);
            }
        })();
        return (0, apiResponse_1.success)(res, property);
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, err.message || 'Server error');
    }
};
exports.createProperty = createProperty;
const getProperties = async (req, res) => {
    try {
        // Build a cache key from the full query string.
        // Authenticated requests get match scores so we skip cache for them.
        const isAuthenticated = !!req.user;
        const cacheKey = isAuthenticated ? null : `properties:${JSON.stringify(req.query)}`;
        if (cacheKey) {
            const cached = cache_1.default.get(cacheKey);
            if (cached) {
                res.setHeader('X-Cache', 'HIT');
                return res.json(cached); // keep raw json for backwards compatibility with front-end
            }
        }
        const { listingType, propertyType, city, country, minPrice, maxPrice, availableFrom, bedrooms, bathrooms, furnishing, amenities, gender, search, page = 1, limit = 10 } = req.query;
        // Build filter object
        const filter = { status: 'active' };
        let currentUser = null;
        // Filter out properties from blocked users
        if (req.user) {
            currentUser = await User_1.default.findById(req.user.id || req.user._id);
            if (currentUser && currentUser.blockedUsers?.length > 0) {
                filter.owner = { $nin: currentUser.blockedUsers };
            }
        }
        if (listingType)
            filter.listingType = listingType;
        if (propertyType)
            filter.propertyType = propertyType;
        if (search) {
            try {
                filter.$text = { $search: search };
            }
            catch {
                const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                filter.$or = [
                    { title: searchRegex },
                    { description: searchRegex },
                    { 'address.city': searchRegex },
                ];
            }
        }
        if (city)
            filter['address.city'] = new RegExp(city, 'i');
        if (country)
            filter['address.country'] = new RegExp(country, 'i');
        if (minPrice || maxPrice) {
            filter['price.amount'] = {};
            if (minPrice)
                filter['price.amount'].$gte = Number(minPrice);
            if (maxPrice)
                filter['price.amount'].$lte = Number(maxPrice);
        }
        if (availableFrom) {
            filter['availability.availableFrom'] = { $lte: new Date(availableFrom) };
        }
        if (bedrooms != null && bedrooms !== 'any' && bedrooms !== '')
            filter['features.bedrooms'] = Number(bedrooms);
        if (bathrooms != null && bathrooms !== 'any' && bathrooms !== '')
            filter['features.bathrooms'] = Number(bathrooms);
        if (furnishing != null && furnishing !== 'any' && furnishing !== '')
            filter['features.furnishing'] = furnishing;
        if (amenities) {
            const amenitiesArray = amenities.split(',');
            filter['features.amenities'] = { $all: amenitiesArray };
        }
        if (gender && gender !== 'any' && gender !== 'all') {
            // ★ FIX #7: Lowercase filter comparison to match schema constraints correctly (male, female, any)
            const genderLower = gender.toLowerCase();
            filter['preferences.gender'] = { $in: [genderLower, 'any'] };
        }
        else if (gender === 'any') {
            filter['preferences.gender'] = 'any';
        }
        if (req.query.occupation) {
            filter['preferences.occupation'] = req.query.occupation;
        }
        if (req.query.lifestyle) {
            const lifestyleArray = req.query.lifestyle.split(',').map(s => s.trim()).filter(Boolean);
            const orConditions = filter.$or ? [...filter.$or] : [];
            if (lifestyleArray.includes('Non-smoking')) {
                orConditions.push({ 'preferences.smoking': false });
            }
            if (lifestyleArray.includes('Pet lover')) {
                orConditions.push({ 'preferences.pets': true });
            }
            if (orConditions.length > 0) {
                filter.$or = orConditions;
            }
        }
        if (req.query.street)
            filter['address.street'] = new RegExp(req.query.street, 'i');
        if (req.query.state)
            filter['address.state'] = new RegExp(req.query.state, 'i');
        if (req.query.zipCode)
            filter['address.zipCode'] = req.query.zipCode;
        if (req.query.petFriendly === 'true') {
            filter['preferences.pets'] = true;
        }
        const lat = req.query.lat ? Number(req.query.lat) : undefined;
        const lng = req.query.lng ? Number(req.query.lng) : undefined;
        const radius = req.query.radius ? Number(req.query.radius) : undefined;
        // ★ FIX #13: Spatial geo search using $near and 2dsphere index instead of rough lat/lng bounding box math
        if (lat !== undefined && lng !== undefined && radius !== undefined) {
            if (isNaN(lat) || isNaN(lng) || isNaN(radius) || radius <= 0) {
                return (0, apiResponse_1.error)(res, 'Invalid geo parameters', 400);
            }
            filter.location = {
                $near: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [lng, lat] // GeoJSON coordinates must be [longitude, latitude]
                    },
                    $maxDistance: radius * 1000 // Convert km to meters
                }
            };
        }
        const skip = (Number(page) - 1) * Number(limit);
        let properties = [];
        let total = 0;
        try {
            [properties, total] = await Promise.all([
                Property_1.default.find(filter)
                    .populate('owner', 'name avatar isBoosted lastActive')
                    .sort(filter.$text ? { score: { $meta: 'textScore' }, isFeatured: -1 } : { isFeatured: -1, createdAt: -1 })
                    .skip(skip)
                    .limit(Number(limit))
                    .lean(),
                Property_1.default.countDocuments(filter)
            ]);
        }
        catch (queryErr) {
            if (filter.$text) {
                // Fallback to regex search if text index fails
                delete filter.$text;
                const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                filter.$or = [
                    { title: searchRegex },
                    { description: searchRegex },
                    { 'address.city': searchRegex },
                ];
                [properties, total] = await Promise.all([
                    Property_1.default.find(filter)
                        .populate('owner', 'name avatar isBoosted lastActive')
                        .sort({ isFeatured: -1, createdAt: -1 })
                        .skip(skip)
                        .limit(Number(limit))
                        .lean(),
                    Property_1.default.countDocuments(filter)
                ]);
            }
            else {
                throw queryErr;
            }
        }
        let propertiesWithScores = properties;
        if (currentUser && currentUser.preferences) {
            propertiesWithScores = propertiesWithScores.map((p) => ({
                ...p,
                matchScore: (0, matchScore_1.calculateMatchScore)(currentUser.preferences, p)
            }));
        }
        const responsePayload = {
            properties: propertiesWithScores,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        };
        if (cacheKey) {
            cache_1.default.set(cacheKey, responsePayload, 60);
            res.setHeader('X-Cache', 'MISS');
        }
        res.json(responsePayload);
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, err.message || 'Server error');
    }
};
exports.getProperties = getProperties;
const getSavedProperties = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.id);
        const properties = await Property_1.default.find({ _id: { $in: user?.savedProperties } }).populate('owner', 'name avatar');
        return (0, apiResponse_1.success)(res, properties);
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.getSavedProperties = getSavedProperties;
const getUserListings = async (req, res) => {
    try {
        const properties = await Property_1.default.find({ owner: req.user?.id }).sort({ createdAt: -1 });
        return (0, apiResponse_1.success)(res, properties);
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.getUserListings = getUserListings;
const getPropertyById = async (req, res) => {
    try {
        const property = await Property_1.default.findById(req.params.id).populate('owner', 'name avatar email phone');
        if (!property) {
            return (0, apiResponse_1.error)(res, 'Property not found', 404);
        }
        Property_1.default.updateOne({ _id: property._id }, { $inc: { views: 1 } }).catch((err) => console.error('Failed to increment view count:', err));
        if (req.user && property.owner && property.owner.email) {
            const viewer = await User_1.default.findById(req.user?.id);
            if (viewer && property.owner._id.toString() !== viewer._id.toString()) {
                setImmediate(() => {
                    emailService_1.default.sendPropertyViewNotification(property.owner.email, property.title, viewer.name).catch((err) => console.error('Failed to send email notification:', err));
                });
            }
        }
        // For frontend compatibility, don't wrap this specific single property result.
        // The previous implementation sent just the object without { success: true }. 
        // Usually standardizing is good, but for GET single we'll return raw for now.
        res.json(property);
    }
    catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return (0, apiResponse_1.error)(res, 'Property not found', 404);
        }
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.getPropertyById = getPropertyById;
const updateProperty = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return (0, apiResponse_1.validationError)(res, errors.array());
    }
    try {
        let property = await Property_1.default.findById(req.params.id);
        if (!property) {
            return (0, apiResponse_1.error)(res, 'Property not found', 404);
        }
        if (property.owner.toString() !== req.user?.id) {
            return (0, apiResponse_1.error)(res, 'Not authorized', 401);
        }
        let images = property.images;
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const uploadPromises = req.files.map(async (file) => {
                const result = await (0, uploadService_1.uploadToCloudinary)(file.buffer, 'flatmates/properties');
                return { url: result.url, caption: '' };
            });
            try {
                const settled = await Promise.all(uploadPromises);
                images.push(...settled);
            }
            catch (error) {
                console.error('Cloudinary upload error:', error);
            }
        }
        if (req.body.removeImages) {
            const removeImages = req.body.removeImages.split(',');
            images = images.filter((image) => {
                if (removeImages.includes(image.url)) {
                    if (image.url.includes('cloudinary.com')) {
                        const publicId = image.url.split('/').slice(-2).join('/').split('.')[0];
                        (0, uploadService_1.deleteFromCloudinary)(publicId).catch(console.error);
                    }
                    return false;
                }
                return true;
            });
        }
        const propertyFields = {};
        if (req.body.address)
            propertyFields.address = (0, formDataHelper_1.parseFormDataJSON)(req.body.address);
        if (req.body.price)
            propertyFields.price = (0, formDataHelper_1.parseFormDataJSON)(req.body.price);
        if (req.body.availability)
            propertyFields.availability = (0, formDataHelper_1.parseFormDataJSON)(req.body.availability);
        if (req.body.features)
            propertyFields.features = (0, formDataHelper_1.parseFormDataJSON)(req.body.features);
        if (req.body.currentOccupants)
            propertyFields.currentOccupants = (0, formDataHelper_1.parseFormDataJSON)(req.body.currentOccupants);
        if (req.body.preferences)
            propertyFields.preferences = (0, formDataHelper_1.parseFormDataJSON)(req.body.preferences);
        const directFields = ['title', 'description', 'propertyType', 'listingType'];
        directFields.forEach(field => {
            if (req.body[field] !== undefined) {
                propertyFields[field] = req.body[field];
            }
        });
        propertyFields.images = images;
        property = await Property_1.default.findByIdAndUpdate(req.params.id, { $set: propertyFields }, { new: true });
        // ★ FIX #12: Invalidate property cache on update to avoid stale search results
        cache_1.default.invalidatePrefix('properties:');
        return (0, apiResponse_1.success)(res, property);
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, err.message || 'Server error');
    }
};
exports.updateProperty = updateProperty;
const deleteProperty = async (req, res) => {
    try {
        const property = await Property_1.default.findById(req.params.id);
        if (!property) {
            return (0, apiResponse_1.error)(res, 'Property not found', 404);
        }
        if (property.owner.toString() !== req.user?.id) {
            return (0, apiResponse_1.error)(res, 'Not authorized', 401);
        }
        await property.deleteOne();
        // ★ FIX #12: Invalidate property cache on delete to avoid stale search results
        cache_1.default.invalidatePrefix('properties:');
        return (0, apiResponse_1.success)(res, { msg: 'Property removed' });
    }
    catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return (0, apiResponse_1.error)(res, 'Property not found', 404);
        }
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.deleteProperty = deleteProperty;
const toggleSaveProperty = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.user?.id);
        const propertyId = req.params.id;
        const property = await Property_1.default.findById(propertyId).populate('owner', 'name email');
        if (!property) {
            return (0, apiResponse_1.error)(res, 'Property not found', 404);
        }
        const isSaved = user?.savedProperties.some((id) => id.toString() === propertyId);
        if (isSaved) {
            user.savedProperties = user.savedProperties.filter((id) => id.toString() !== propertyId);
            await user.save();
            // Notice res.json here to keep backward compatibility with authSlice 
            res.json({ saved: false, savedProperties: user.savedProperties });
        }
        else {
            user.savedProperties.push(propertyId);
            await user.save();
            if (property.owner && property.owner.email && property.owner._id.toString() !== user?._id.toString()) {
                setImmediate(() => {
                    emailService_1.default.sendPropertySavedNotification(property.owner.email, property.title, user?.name || 'Someone').catch((err) => console.error('Failed to send email notification:', err));
                });
            }
            res.json({ saved: true, savedProperties: user.savedProperties });
        }
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.toggleSaveProperty = toggleSaveProperty;
//# sourceMappingURL=propertyController.js.map