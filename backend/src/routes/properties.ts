import express from 'express';
import { check } from 'express-validator';
import { propertyImageUpload } from '../services/uploadService';
import { parseFormDataJSON } from '../utils/formDataHelper';
import { protect } from '../middleware/auth';
import { wrapHandler } from '../types/express';
import {
  createProperty,
  getProperties,
  getSavedProperties,
  getUserListings,
  getPropertyById,
  updateProperty,
  deleteProperty,
  toggleSaveProperty
} from '../controllers/propertyController';

const router = express.Router();

// @route   POST api/properties
// @desc    Create a property listing
// @access  Private
router.post(
  '/',
  [
    protect,
    propertyImageUpload.array('images', 10),
    check('title', 'Title is required').not().isEmpty(),
    check('description', 'Description is required').not().isEmpty(),
    check('propertyType', 'Property type is required').isIn(['room', 'flat', 'house', 'studio', 'apartment']),
    check('listingType', 'Listing type is required').isIn([
      'room_in_flat',
      'roommates_for_flat',
      'occupied_flat',
      'entire_property'
    ]),
    check('address').custom((value) => {
      const address = parseFormDataJSON(value);
      if (!address || !address.city) return false;
      if (!address.country) return false;
      return true;
    }).withMessage('City and Country are required'),
    check('price').custom((value) => {
      const price = parseFormDataJSON(value);
      if (!price || !price.amount) return false;
      return true;
    }).withMessage('Price amount is required'),
    check('availability').custom((value) => {
      const availability = parseFormDataJSON(value);
      if (!availability || !availability.availableFrom) return false;
      return true;
    }).withMessage('Available from date is required')
  ],
  wrapHandler(createProperty)
);

// @route   GET api/properties
// @desc    Get all properties with filters
// @access  Public
router.get('/', getProperties);

// @route   GET api/properties/user/saved
// @desc    Get user's saved properties
// @access  Private
router.get(
  '/user/saved',
  protect,
  wrapHandler(getSavedProperties)
);

// @route   GET api/properties/user/listings
// @desc    Get user's property listings
// @access  Private
router.get(
  '/user/listings',
  protect,
  wrapHandler(getUserListings)
);

// @route   GET api/properties/:id
// @desc    Get property by ID
// @access  Public
router.get('/:id', getPropertyById);

// @route   PUT api/properties/:id
// @desc    Update a property
// @access  Private
router.put(
  '/:id',
  [
    protect,
    propertyImageUpload.array('images', 10),
    check('title', 'Title is required').optional().not().isEmpty(),
    check('description', 'Description is required').optional().not().isEmpty(),
    check('propertyType', 'Property type is required').optional().isIn(['room', 'flat', 'house', 'studio']),
    check('price.amount', 'Price amount is required').optional().isNumeric()
  ],
  wrapHandler(updateProperty)
);

// @route   DELETE api/properties/:id
// @desc    Delete a property
// @access  Private
router.delete(
  '/:id',
  protect,
  wrapHandler(deleteProperty)
);

// @route   POST api/properties/:id/save
// @desc    Save/unsave a property
// @access  Private
router.post(
  '/:id/save',
  protect,
  wrapHandler(toggleSaveProperty)
);

export default router;
