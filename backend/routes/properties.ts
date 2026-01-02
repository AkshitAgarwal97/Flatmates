import Property from '../models/Property';
import User from '../models/User';
import emailService from '../services/emailService';
import express, { Request, Response } from 'express';
import passport from 'passport';
import { check, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';
import { parseFormDataJSON } from '../utils/formDataHelper';
// import { cloudinary, configured as cloudinaryConfigured } from '../config/cloudinary';
// import fs from 'fs';
const router = express.Router();

// Extend Express Request to include user property
interface AuthenticatedRequest extends Request {
  user?: any;
}

// Property request body interfaces
interface CreatePropertyRequest {
  title: string;
  description: string;
  propertyType: 'room' | 'flat' | 'house' | 'studio';
  listingType: 'room_in_flat' | 'roommates_for_flat' | 'occupied_flat' | 'entire_property';
  address: {
    street?: string;
    city: string;
    state?: string;
    country: string;
    zipCode?: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  price: {
    amount: number;
    brokerage?: number;
  }
  availability: {
    availableFrom: string;
    availableUntil?: string;
    minimumStay?: number;
    maximumStay?: number;
  };
  features?: {
    bedrooms?: number;
    bathrooms?: number;
    area?: number;
    furnishing?: 'furnished' | 'unfurnished' | 'semi-furnished';
    amenities?: string[];
    utilities?: string[];
  };
  currentOccupants?: {
    total: number;
    details: Array<{
      gender: 'male' | 'female' | 'other';
      age?: number;
      occupation?: string;
    }>;
  };
  preferences?: {
    gender?: 'male' | 'female' | 'any';
    ageRange?: {
      min?: number;
      max?: number;
    };
    occupation?: string[];
    smoking?: boolean;
    pets?: boolean;
  };
}

interface UpdatePropertyRequest extends Partial<CreatePropertyRequest> {
  removeImages?: string;
}

// Set up multer for file uploads - using memory storage since we upload to Cloudinary immediately
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Images only!'));
    }
  }
});

// @route   POST api/properties
// @desc    Create a property listing
// @access  Private
router.post(
  '/',
  [
    passport.authenticate('jwt', { session: false }),
    upload.array('images', 10),
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
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
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

        const uploadPromises = (req.files as Express.Multer.File[]).map(file => {
          return uploadFileToS3(file.buffer, file.originalname, file.mimetype)
            .then((url: string) => ({ url, caption: '' }))
            .catch((err: any) => ({ error: err }));
        });

        const settled = await Promise.all(uploadPromises);

        for (const result of settled) {
          if ((result as any).error) {
            console.error('S3 upload error:', (result as any).error);
            console.error('S3 upload error:', (result as any).error);
            throw new Error(`Image upload failed: ${(result as any).error.message || 'Unknown S3 error'}`);
          }
          images.push(result);
        }
      }

      // Parse nested objects from FormData
      const parsedPreferences = parseFormDataJSON(req.body.preferences) || {};
      const filteredPreferences: any = {};

      // Only include non-empty preference values
      if (parsedPreferences.gender && parsedPreferences.gender !== '') {
        filteredPreferences.gender = parsedPreferences.gender;
      }
      if (parsedPreferences.occupation && parsedPreferences.occupation !== '') {
        filteredPreferences.occupation = parsedPreferences.occupation;
      }

      // Log request body for debugging price issue
      console.log('Creating property payload:', JSON.stringify(req.body, null, 2));
      console.log('Parsed price:', parseFormDataJSON(req.body.price));

      // Create new property
      const newProperty = new Property({
        owner: req.user?.id,
        title: req.body.title,
        description: req.body.description,
        propertyType: req.body.propertyType,
        listingType: req.body.listingType,
        address: parseFormDataJSON(req.body.address),
        price: parseFormDataJSON(req.body.price),
        availability: parseFormDataJSON(req.body.availability),
        features: parseFormDataJSON(req.body.features) || {},
        images,
        currentOccupants: parseFormDataJSON(req.body.currentOccupants) || { total: 0, details: [] },
        preferences: filteredPreferences
      });

      const property = await newProperty.save();

      res.json(property);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).json({ msg: err.message || 'Server error' });
    }
  }
);

// @route   GET api/properties
// @desc    Get all properties with filters
// @access  Public
router.get('/', async (req: Request, res: Response) => {
  try {
    const {
      listingType,
      propertyType,
      city,
      country,
      minPrice,
      maxPrice,
      availableFrom,
      bedrooms,
      bathrooms,
      furnishing,
      amenities,
      gender,
      search,
      page = 1,
      limit = 10
    } = req.query;

    // Import models dynamically to avoid circular dependencies
    const Property = require('../models/Property').default;

    // Build filter object
    const filter: any = { status: 'active' };

    if (listingType) filter.listingType = listingType;
    if (propertyType) filter.propertyType = propertyType;

    if (search) {
      filter.$or = [
        { title: new RegExp(search as string, 'i') },
        { description: new RegExp(search as string, 'i') }
      ];
    }

    if (city) filter['address.city'] = new RegExp(city as string, 'i');
    if (country) filter['address.country'] = new RegExp(country as string, 'i');

    if (minPrice || maxPrice) {
      filter['price.amount'] = {};
      if (minPrice) filter['price.amount'].$gte = Number(minPrice);
      if (maxPrice) filter['price.amount'].$lte = Number(maxPrice);
    }

    if (availableFrom) {
      filter['availability.availableFrom'] = { $lte: new Date(availableFrom as string) };
    }

    if (bedrooms != null && bedrooms !== 'any' && bedrooms !== '') filter['features.bedrooms'] = Number(bedrooms);
    if (bathrooms != null && bathrooms !== 'any' && bathrooms !== '') filter['features.bathrooms'] = Number(bathrooms);
    if (furnishing != null && furnishing !== 'any' && furnishing !== '') filter['features.furnishing'] = furnishing;

    if (amenities) {
      const amenitiesArray = (amenities as string).split(',');
      filter['features.amenities'] = { $all: amenitiesArray };
    }

    if (gender) filter['preferences.gender'] = gender;

    // Support pet-friendly filtering
    if (req.query.petFriendly === 'true') {
      filter['preferences.pets'] = true;
    }

    // Support lifestyle filtering (stored in preferences or features)
    if (req.query.lifestyle) {
      const lifestyleArray = (req.query.lifestyle as string).split(',').map(s => s.trim()).filter(Boolean);
      const orConditions: any[] = filter.$or ? [...filter.$or] : [];
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
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/properties/user/saved
// @desc    Get user's saved properties
// @access  Private
router.get('/user/saved', passport.authenticate('jwt', { session: false }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Import models dynamically to avoid circular dependencies
    const Property = require('../models/Property').default;
    const User = require('../models/User').default;

    const user = await User.findById(req.user?.id);
    const properties = await Property.find({ _id: { $in: user?.savedProperties } }).populate(
      'owner',
      'name avatar'
    );

    res.json(properties);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/properties/user/listings
// @desc    Get user's property listings
// @access  Private
router.get('/user/listings', passport.authenticate('jwt', { session: false }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Import models dynamically to avoid circular dependencies
    const Property = require('../models/Property').default;

    const properties = await Property.find({ owner: req.user?.id }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});
// @route   GET api/properties/:id
// @desc    Get property by ID
// @access  Public
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
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
    if (req.user && property.owner && (property.owner as any).email) {
      const viewer = await require('../models/User').default.findById((req.user as any)?.id);
      if (viewer && (property.owner as any)._id.toString() !== viewer._id.toString()) {
        const emailService = require('../services/emailService').default;
        setImmediate(() => {
          emailService.sendPropertyViewNotification(
            (property.owner as any).email,
            property.title,
            viewer.name
          ).catch((err: any) => console.error('Failed to send email notification:', err));
        });
      }
    }

    res.json(property);
  } catch (err: any) {
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
router.put(
  '/:id',
  [
    passport.authenticate('jwt', { session: false }),
    upload.array('images', 10),
    check('title', 'Title is required').optional().not().isEmpty(),
    check('description', 'Description is required').optional().not().isEmpty(),
    check('propertyType', 'Property type is required').optional().isIn(['room', 'flat', 'house', 'studio']),
    check('price.amount', 'Price amount is required').optional().isNumeric()
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Use top-level imported Property model
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

        const { uploadFileToS3 } = require('../services/s3Service');

        const uploadPromises = (req.files as Express.Multer.File[]).map(file => {
          return uploadFileToS3(file.buffer, file.originalname, file.mimetype)
            .then((url: string) => ({ url, caption: '' }))
            .catch((err: any) => ({ error: err }));
        });

        const settled = await Promise.all(uploadPromises);

        for (const result of settled) {
          if ((result as any).error) {
            console.error('S3 upload error:', (result as any).error);
            continue;
          }
          images.push(result);
        }
      }

      // Remove images if specified (removes from DB, future TODO: remove from Cloudinary)
      if (req.body.removeImages) {
        const removeImages = (req.body.removeImages as string).split(',');
        images = images.filter((image: any) => !removeImages.includes(image.url));
      }

      // Update property fields
      const propertyFields: any = {};

      // Parse nested objects
      if (req.body.address) propertyFields.address = parseFormDataJSON(req.body.address);
      if (req.body.price) propertyFields.price = parseFormDataJSON(req.body.price);
      if (req.body.availability) propertyFields.availability = parseFormDataJSON(req.body.availability);
      if (req.body.features) propertyFields.features = parseFormDataJSON(req.body.features);
      if (req.body.currentOccupants) propertyFields.currentOccupants = parseFormDataJSON(req.body.currentOccupants);
      if (req.body.preferences) propertyFields.preferences = parseFormDataJSON(req.body.preferences);

      // Handle direct fields
      const directFields = ['title', 'description', 'propertyType', 'listingType', 'userType'];
      directFields.forEach(field => {
        if (req.body[field] !== undefined) {
          propertyFields[field] = req.body[field];
        }
      });

      // Add images to update fields
      propertyFields.images = images;

      // Update property
      property = await Property.findByIdAndUpdate(
        req.params.id,
        { $set: propertyFields },
        { new: true }
      );

      res.json(property);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).json({ msg: err.message || 'Server error' });
    }
  }
);

// @route   DELETE api/properties/:id
// @desc    Delete a property
// @access  Private
router.delete('/:id', passport.authenticate('jwt', { session: false }), async (req: AuthenticatedRequest, res: Response) => {
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
  } catch (err: any) {
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
router.post('/:id/save', passport.authenticate('jwt', { session: false }), async (req: AuthenticatedRequest, res: Response) => {
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
    const isSaved = user?.savedProperties.some((id: any) => id.toString() === propertyId);

    if (isSaved) {
      // Unsave property
      user.savedProperties = user.savedProperties.filter((id: any) => id.toString() !== propertyId);
      await user.save();
      return res.json({ saved: false, savedProperties: user.savedProperties });
    } else {
      // Save property
      user.savedProperties.push(propertyId);
      await user.save();

      // Send email notification to property owner
      if (property.owner && (property.owner as any).email && (property.owner as any)._id.toString() !== user?._id.toString()) {
        setImmediate(() => {
          emailService.sendPropertySavedNotification(
            (property.owner as any).email,
            property.title,
            user?.name || 'Someone'
          ).catch((err: any) => console.error('Failed to send email notification:', err));
        });
      }

      return res.json({ saved: true, savedProperties: user.savedProperties });
    }
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

export default router;
