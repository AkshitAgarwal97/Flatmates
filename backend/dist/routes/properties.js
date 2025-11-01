"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
// Set up multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/properties/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
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
    (0, express_validator_1.check)('propertyType', 'Property type is required').isIn(['room', 'flat', 'house', 'studio']),
    (0, express_validator_1.check)('listingType', 'Listing type is required').isIn([
        'room_in_flat',
        'roommates_for_flat',
        'occupied_flat',
        'entire_property'
    ]),
    (0, express_validator_1.check)('address.city', 'City is required').not().isEmpty(),
    (0, express_validator_1.check)('address.country', 'Country is required').not().isEmpty(),
    (0, express_validator_1.check)('price.amount', 'Price amount is required').isNumeric(),
    (0, express_validator_1.check)('availability.availableFrom', 'Availability date is required').isISO8601()
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Import models dynamically to avoid circular dependencies
        const Property = require('../models/Property').default;
        const User = require('../models/User').default;
        // Check if user type matches listing type
        const user = await User.findById(req.user?.id);
        const { listingType } = req.body;
        let isValidUserType = false;
        switch (listingType) {
            case 'room_in_flat':
            case 'occupied_flat':
                isValidUserType = user?.userType === 'broker_dealer';
                break;
            case 'roommates_for_flat':
                isValidUserType = user?.userType === 'roommate_seeker';
                break;
            case 'entire_property':
                isValidUserType = user?.userType === 'property_owner';
                break;
        }
        if (!isValidUserType) {
            return res.status(400).json({
                errors: [{ msg: 'User type does not match the listing type' }]
            });
        }
        // Process uploaded images
        const images = req.files && Array.isArray(req.files)
            ? req.files.map((file) => ({
                url: `/uploads/properties/${file.filename}`,
                caption: ''
            }))
            : [];
        // Create new property
        // If the owner is a broker/dealer ensure brokerage is provided and numeric
        if (user?.userType === 'broker_dealer') {
            const brokerageVal = req.body?.price?.brokerage;
            if (brokerageVal === undefined || brokerageVal === null || isNaN(Number(brokerageVal))) {
                return res.status(400).json({ errors: [{ msg: 'Brokerage is required for Broker/Dealer listings' }] });
            }
        }
        const newProperty = new Property({
            owner: req.user?.id,
            title: req.body.title,
            description: req.body.description,
            propertyType: req.body.propertyType,
            listingType: req.body.listingType,
            address: req.body.address,
            price: req.body.price,
            availability: req.body.availability,
            features: req.body.features || {},
            images,
            currentOccupants: req.body.currentOccupants || { total: 0, details: [] },
            preferences: req.body.preferences || {}
        });
        const property = await newProperty.save();
        res.json(property);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   GET api/properties
// @desc    Get all properties with filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { listingType, propertyType, city, country, minPrice, maxPrice, availableFrom, bedrooms, bathrooms, furnishing, amenities, gender, page = 1, limit = 10 } = req.query;
        // Import models dynamically to avoid circular dependencies
        const Property = require('../models/Property').default;
        // Build filter object
        const filter = { status: 'active' };
        if (listingType)
            filter.listingType = listingType;
        if (propertyType)
            filter.propertyType = propertyType;
        if (city)
            filter['address.city'] = new RegExp(city, 'i');
        if (country)
            filter['address.country'] = new RegExp(country, 'i');
        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice)
                filter.price.amount = { $gte: Number(minPrice) };
            if (maxPrice)
                filter.price.amount = { ...filter.price.amount, $lte: Number(maxPrice) };
        }
        if (availableFrom) {
            filter['availability.availableFrom'] = { $lte: new Date(availableFrom) };
        }
        if (bedrooms)
            filter['features.bedrooms'] = Number(bedrooms);
        if (bathrooms)
            filter['features.bathrooms'] = Number(bathrooms);
        if (furnishing)
            filter['features.furnishing'] = furnishing;
        if (amenities) {
            const amenitiesArray = amenities.split(',');
            filter['features.amenities'] = { $all: amenitiesArray };
        }
        if (gender)
            filter['preferences.gender'] = gender;
        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        const properties = await Property.find(filter)
            .populate('owner', 'name avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await Property.countDocuments(filter);
        res.json({
            properties,
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
        // Import models dynamically to avoid circular dependencies
        const Property = require('../models/Property').default;
        let property = await Property.findById(req.params.id);
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
            const newImages = req.files.map((file) => ({
                url: `/uploads/properties/${file.filename}`,
                caption: ''
            }));
            images = [...images, ...newImages];
        }
        // Remove images if specified
        if (req.body.removeImages) {
            const removeImages = req.body.removeImages.split(',');
            images = images.filter((image) => !removeImages.includes(image.url));
        }
        // Update property fields
        const propertyFields = {};
        for (const [key, value] of Object.entries(req.body)) {
            if (key !== 'removeImages') {
                // Handle nested objects
                if (key.includes('.')) {
                    const [parent, child] = key.split('.');
                    if (!propertyFields[parent])
                        propertyFields[parent] = {};
                    propertyFields[parent][child] = value;
                }
                else {
                    propertyFields[key] = value;
                }
            }
        }
        // Add images to update fields
        propertyFields.images = images;
        // Update property
        property = await Property.findByIdAndUpdate(req.params.id, { $set: propertyFields }, { new: true });
        res.json(property);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
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
        const user = await User.findById(req.user?.id);
        const propertyId = req.params.id;
        // Check if property exists
        const property = await Property.findById(propertyId);
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
            return res.json({ saved: true, savedProperties: user.savedProperties });
        }
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
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
exports.default = router;
//# sourceMappingURL=properties.js.map