"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Property_1 = __importDefault(require("../models/Property"));
const User_1 = __importDefault(require("../models/User"));
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const notificationService_1 = __importDefault(require("../services/notificationService"));
const formDataHelper_1 = require("../utils/formDataHelper");
// import { cloudinary, configured as cloudinaryConfigured } from '../config/cloudinary';
// import fs from 'fs';
const router = express_1.default.Router();
// Set up multer for file uploads - using memory storage since we upload to Cloudinary immediately
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Error: Images only!'));
        }
    }
});
// @route   POST api/properties
// @desc    Create a property listing
// @access  Private
router.post('/', [
    passport_1.default.authenticate('jwt', { session: false }),
    upload.array('images', 10),
    (0, express_validator_1.check)('title', 'Title is required').not().isEmpty(),
    (0, express_validator_1.check)('description', 'Description is required').not().isEmpty(),
    (0, express_validator_1.check)('propertyType', 'Property type is required').isIn(['room', 'flat', 'house', 'studio', 'apartment']),
    (0, express_validator_1.check)('listingType', 'Listing type is required').isIn([
        'room_in_flat',
        'roommates_for_flat',
        'occupied_flat',
        'entire_property'
    ]),
    (0, express_validator_1.check)('address').custom((value) => {
        const address = (0, formDataHelper_1.parseFormDataJSON)(value);
        if (!address || !address.city)
            return false;
        if (!address.country)
            return false;
        return true;
    }).withMessage('City and Country are required'),
    (0, express_validator_1.check)('price').custom((value) => {
        const price = (0, formDataHelper_1.parseFormDataJSON)(value);
        if (!price || !price.amount)
            return false;
        return true;
    }).withMessage('Price amount is required'),
    (0, express_validator_1.check)('availability').custom((value) => {
        const availability = (0, formDataHelper_1.parseFormDataJSON)(value);
        if (!availability || !availability.availableFrom)
            return false;
        return true;
    }).withMessage('Available from date is required')
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Import Property model dynamically to avoid circular dependencies
        // const Property = require('../models/Property').default; // Already imported at top
        // Process uploaded images
        const images = [];
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            // Import S3 service dynamically or at top (better at top, but for now strict edit)
            const { uploadFileToS3 } = require('../services/s3Service');
            const uploadPromises = req.files.map(file => {
                return uploadFileToS3(file.buffer, file.originalname, file.mimetype)
                    .then((url) => ({ url, caption: '' }))
                    .catch((err) => ({ error: err }));
            });
            const settled = await Promise.all(uploadPromises);
            for (const result of settled) {
                if (result.error) {
                    console.error('S3 upload error:', result.error);
                    console.error('S3 upload error:', result.error);
                    throw new Error(`Image upload failed: ${result.error.message || 'Unknown S3 error'}`);
                }
                images.push(result);
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
        // Log request body for debugging price issue
        console.log('Creating property payload:', JSON.stringify(req.body, null, 2));
        console.log('Parsed price:', (0, formDataHelper_1.parseFormDataJSON)(req.body.price));
        // Create new property
        const newProperty = new Property_1.default({
            owner: req.user?.id,
            title: req.body.title,
            description: req.body.description,
            propertyType: req.body.propertyType,
            listingType: req.body.listingType,
            address: (0, formDataHelper_1.parseFormDataJSON)(req.body.address),
            price: (0, formDataHelper_1.parseFormDataJSON)(req.body.price),
            availability: (0, formDataHelper_1.parseFormDataJSON)(req.body.availability),
            features: (0, formDataHelper_1.parseFormDataJSON)(req.body.features) || {},
            images,
            currentOccupants: (0, formDataHelper_1.parseFormDataJSON)(req.body.currentOccupants) || { total: 0, details: [] },
            preferences: filteredPreferences
        });
        const property = await newProperty.save();
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
        res.json(property);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: err.message || 'Server error' });
    }
});
// @route   GET api/properties
// @desc    Get all properties with filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { listingType, propertyType, city, country, minPrice, maxPrice, availableFrom, bedrooms, bathrooms, furnishing, amenities, gender, search, page = 1, limit = 10 } = req.query;
        // Import models dynamically to avoid circular dependencies
        const Property = require('../models/Property').default;
        // Build filter object
        const filter = { status: 'active' };
        // Filter out properties from blocked users
        if (req.user) {
            const User = require('../models/User').default;
            const currentUser = await User.findById(req.user.id || req.user._id);
            if (currentUser && currentUser.blockedUsers?.length > 0) {
                filter.owner = { $nin: currentUser.blockedUsers };
            }
        }
        if (listingType)
            filter.listingType = listingType;
        if (propertyType)
            filter.propertyType = propertyType;
        if (search) {
            const searchRegex = new RegExp(search, 'i');
            filter.$or = [
                { title: searchRegex },
                { description: searchRegex },
                { 'address.city': searchRegex },
                { 'address.street': searchRegex },
                { 'address.state': searchRegex },
                { 'address.zipCode': searchRegex }
            ];
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
            filter['preferences.gender'] = { $in: [gender, 'any', 'Any'] };
        }
        else if (gender === 'any') {
            filter['preferences.gender'] = { $in: ['any', 'Any'] };
        }
        // Occupation filtering (checks if the requested occupation is in the preferences.occupation array)
        if (req.query.occupation) {
            filter['preferences.occupation'] = req.query.occupation;
        }
        // Lifestyle filtering
        if (req.query.lifestyle) {
            const lifestyle = req.query.lifestyle.split(',');
            filter['preferences.lifestyle'] = { $all: lifestyle };
        }
        // Advanced Location filtering
        if (req.query.street)
            filter['address.street'] = new RegExp(req.query.street, 'i');
        if (req.query.state)
            filter['address.state'] = new RegExp(req.query.state, 'i');
        if (req.query.zipCode)
            filter['address.zipCode'] = req.query.zipCode;
        // Support pet-friendly filtering
        if (req.query.petFriendly === 'true') {
            filter['preferences.pets'] = true;
        }
        // Support lifestyle filtering (stored in preferences or features)
        if (req.query.lifestyle) {
            const lifestyleArray = req.query.lifestyle.split(',').map(s => s.trim()).filter(Boolean);
            const orConditions = filter.$or ? [...filter.$or] : [];
            // Add explicit conditions for recognized lifestyle preferences
            if (lifestyleArray.includes('Non-smoking')) {
                orConditions.push({ 'preferences.smoking': false });
            }
            // Add other lifestyle mappings here as needed (e.g., 'Pet lover' -> preferences.pets: true)
            if (lifestyleArray.includes('Pet lover')) {
                orConditions.push({ 'preferences.pets': true });
            }
            if (orConditions.length > 0) {
                filter.$or = orConditions;
            }
        }
        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        const properties = await Property.find(filter)
            .populate('owner', 'name avatar preferences isBoosted')
            // .populate('createdBy', 'name avatar preferences lastActive averageResponseTime isBoosted')
            .sort({ isFeatured: -1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await Property.countDocuments(filter);
        // Calculate match scores if authenticated
        let propertiesWithScores = properties.map((p) => p.toObject());
        if (req.user) {
            const { calculateMatchScore } = require('../utils/matchScore');
            const User = require('../models/User').default;
            const currentUser = await User.findById(req.user.id || req.user._id);
            if (currentUser && currentUser.preferences) {
                propertiesWithScores = propertiesWithScores.map((p) => ({
                    ...p,
                    matchScore: calculateMatchScore(currentUser.preferences, p)
                }));
            }
        }
        res.json({
            properties: propertiesWithScores,
            pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                pages: Math.ceil(total / Number(limit))
            }
        });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ message: 'Server error', error: err.message, stack: err.stack });
    }
});
// @route   GET api/properties/user/saved
// @desc    Get user's saved properties
// @access  Private
router.get('/user/saved', passport_1.default.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Import models dynamically to avoid circular dependencies
        const Property = require('../models/Property').default;
        const User = require('../models/User').default;
        const user = await User.findById(req.user?.id);
        const properties = await Property.find({ _id: { $in: user?.savedProperties } }).populate('owner', 'name avatar');
        res.json(properties);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   GET api/properties/user/listings
// @desc    Get user's property listings
// @access  Private
router.get('/user/listings', passport_1.default.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Import models dynamically to avoid circular dependencies
        const Property = require('../models/Property').default;
        const properties = await Property.find({ owner: req.user?.id }).sort({ createdAt: -1 });
        res.json(properties);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   GET api/properties/:id
// @desc    Get property by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        // Import models dynamically to avoid circular dependencies
        const Property = require('../models/Property').default;
        const property = await Property.findById(req.params.id).populate('owner', 'name avatar email phone');
        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }
        // Increment view count
        property.views += 1;
        await property.save();
        // Send email notification to property owner if viewed by authenticated user
        if (req.user && property.owner && property.owner.email) {
            const viewer = await require('../models/User').default.findById(req.user?.id);
            if (viewer && property.owner._id.toString() !== viewer._id.toString()) {
                const emailService = require('../services/emailService').default;
                setImmediate(() => {
                    emailService.sendPropertyViewNotification(property.owner.email, property.title, viewer.name).catch((err) => console.error('Failed to send email notification:', err));
                });
            }
        }
        res.json(property);
    }
    catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Property not found' });
        }
        res.status(500).send('Server error');
    }
});
// @route   PUT api/properties/:id
// @desc    Update a property
// @access  Private
router.put('/:id', [
    passport_1.default.authenticate('jwt', { session: false }),
    upload.array('images', 10),
    (0, express_validator_1.check)('title', 'Title is required').optional().not().isEmpty(),
    (0, express_validator_1.check)('description', 'Description is required').optional().not().isEmpty(),
    (0, express_validator_1.check)('propertyType', 'Property type is required').optional().isIn(['room', 'flat', 'house', 'studio']),
    (0, express_validator_1.check)('price.amount', 'Price amount is required').optional().isNumeric()
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Use top-level imported Property model
        let property = await Property_1.default.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }
        // Check ownership
        if (property.owner.toString() !== req.user?.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        // Process uploaded images
        let images = property.images;
        if (req.files && Array.isArray(req.files) && req.files.length > 0) {
            const { uploadFileToS3 } = require('../services/s3Service');
            const uploadPromises = req.files.map(file => {
                return uploadFileToS3(file.buffer, file.originalname, file.mimetype)
                    .then((url) => ({ url, caption: '' }))
                    .catch((err) => ({ error: err }));
            });
            const settled = await Promise.all(uploadPromises);
            for (const result of settled) {
                if (result.error) {
                    console.error('S3 upload error:', result.error);
                    continue;
                }
                images.push(result);
            }
        }
        // Remove images if specified (removes from DB, future TODO: remove from Cloudinary)
        if (req.body.removeImages) {
            const removeImages = req.body.removeImages.split(',');
            images = images.filter((image) => !removeImages.includes(image.url));
        }
        // Update property fields
        const propertyFields = {};
        // Parse nested objects
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
        // Handle direct fields
        const directFields = ['title', 'description', 'propertyType', 'listingType'];
        directFields.forEach(field => {
            if (req.body[field] !== undefined) {
                propertyFields[field] = req.body[field];
            }
        });
        // Add images to update fields
        propertyFields.images = images;
        // Update property
        property = await Property_1.default.findByIdAndUpdate(req.params.id, { $set: propertyFields }, { new: true });
        res.json(property);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: err.message || 'Server error' });
    }
});
// @route   DELETE api/properties/:id
// @desc    Delete a property
// @access  Private
router.delete('/:id', passport_1.default.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Import models dynamically to avoid circular dependencies
        const Property = require('../models/Property').default;
        const property = await Property.findById(req.params.id);
        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }
        // Check ownership
        if (property.owner.toString() !== req.user?.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        await property.deleteOne();
        res.json({ msg: 'Property removed' });
    }
    catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Property not found' });
        }
        res.status(500).send('Server error');
    }
});
// @route   POST api/properties/:id/save
// @desc    Save/unsave a property
// @access  Private
router.post('/:id/save', passport_1.default.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Import models dynamically to avoid circular dependencies
        const Property = require('../models/Property').default;
        const User = require('../models/User').default;
        const emailService = require('../services/emailService').default;
        const user = await User.findById(req.user?.id);
        const propertyId = req.params.id;
        // Check if property exists
        const property = await Property.findById(propertyId).populate('owner', 'name email');
        if (!property) {
            return res.status(404).json({ msg: 'Property not found' });
        }
        // Check if already saved
        const isSaved = user?.savedProperties.some((id) => id.toString() === propertyId);
        if (isSaved) {
            // Unsave property
            user.savedProperties = user.savedProperties.filter((id) => id.toString() !== propertyId);
            await user.save();
            return res.json({ saved: false, savedProperties: user.savedProperties });
        }
        else {
            // Save property
            user.savedProperties.push(propertyId);
            await user.save();
            // Send email notification to property owner
            if (property.owner && property.owner.email && property.owner._id.toString() !== user?._id.toString()) {
                setImmediate(() => {
                    emailService.sendPropertySavedNotification(property.owner.email, property.title, user?.name || 'Someone').catch((err) => console.error('Failed to send email notification:', err));
                });
            }
            return res.json({ saved: true, savedProperties: user.savedProperties });
        }
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
exports.default = router;
//# sourceMappingURL=properties.js.map