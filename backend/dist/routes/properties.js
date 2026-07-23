"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const uploadService_1 = require("../services/uploadService");
const formDataHelper_1 = require("../utils/formDataHelper");
const auth_1 = require("../middleware/auth");
const express_2 = require("../types/express");
const propertyController_1 = require("../controllers/propertyController");
const router = express_1.default.Router();
// @route   POST api/properties
// @desc    Create a property listing
// @access  Private
router.post('/', [
    auth_1.protect,
    uploadService_1.propertyImageUpload.array('images', 10),
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
], (0, express_2.wrapHandler)(propertyController_1.createProperty));
// @route   GET api/properties
// @desc    Get all properties with filters
// @access  Public
router.get('/', propertyController_1.getProperties);
// @route   GET api/properties/user/saved
// @desc    Get user's saved properties
// @access  Private
router.get('/user/saved', auth_1.protect, (0, express_2.wrapHandler)(propertyController_1.getSavedProperties));
// @route   GET api/properties/user/listings
// @desc    Get user's property listings
// @access  Private
router.get('/user/listings', auth_1.protect, (0, express_2.wrapHandler)(propertyController_1.getUserListings));
// @route   GET api/properties/:id
// @desc    Get property by ID
// @access  Public
router.get('/:id', propertyController_1.getPropertyById);
// @route   PUT api/properties/:id
// @desc    Update a property
// @access  Private
router.put('/:id', [
    auth_1.protect,
    uploadService_1.propertyImageUpload.array('images', 10),
    (0, express_validator_1.check)('title', 'Title is required').optional().not().isEmpty(),
    (0, express_validator_1.check)('description', 'Description is required').optional().not().isEmpty(),
    (0, express_validator_1.check)('propertyType', 'Property type is required').optional().isIn(['room', 'flat', 'house', 'studio']),
    (0, express_validator_1.check)('price.amount', 'Price amount is required').optional().isNumeric()
], (0, express_2.wrapHandler)(propertyController_1.updateProperty));
// @route   DELETE api/properties/:id
// @desc    Delete a property
// @access  Private
router.delete('/:id', auth_1.protect, (0, express_2.wrapHandler)(propertyController_1.deleteProperty));
// @route   POST api/properties/:id/save
// @desc    Save/unsave a property
// @access  Private
router.post('/:id/save', auth_1.protect, (0, express_2.wrapHandler)(propertyController_1.toggleSaveProperty));
exports.default = router;
//# sourceMappingURL=properties.js.map