import express, { Request, Response } from 'express';
import passport from 'passport';
import { check, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';

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

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/properties/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

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
    check('propertyType', 'Property type is required').isIn(['room', 'flat', 'house', 'studio']),
    check('listingType', 'Listing type is required').isIn([
      'room_in_flat',
      'roommates_for_flat',
      'occupied_flat',
      'entire_property'
    ]),
    check('address.city', 'City is required').not().isEmpty(),
    check('address.country', 'Country is required').not().isEmpty(),
    check('price.amount', 'Price amount is required').isNumeric(),
    check('availability.availableFrom', 'Availability date is required').isISO8601()
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
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
        ? req.files.map((file: Express.Multer.File) => ({
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
        amenities: req.body.anenities,
        features: req.body.features || {},
        images,
        currentOccupants: req.body.currentOccupants || { total: 0, details: [] },
        preferences: req.body.preferences || {}
      });

      const property = await newProperty.save();

      res.json(property);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
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
      page = 1,
      limit = 10
    } = req.query;

    // Import models dynamically to avoid circular dependencies
    const Property = require('../models/Property').default;
    
    // Build filter object
    const filter: any = { status: 'active' };

    if (listingType) filter.listingType = listingType;
    if (propertyType) filter.propertyType = propertyType;
    if (city) filter['address.city'] = new RegExp(city as string, 'i');
    if (country) filter['address.country'] = new RegExp(country as string, 'i');
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.amount = { $gte: Number(minPrice) };
      if (maxPrice) filter.price.amount = { ...filter.price.amount, $lte: Number(maxPrice) };
    }
    
    if (availableFrom) {
      filter['availability.availableFrom'] = { $lte: new Date(availableFrom as string) };
    }
    
    if (bedrooms) filter['features.bedrooms'] = Number(bedrooms);
    if (bathrooms) filter['features.bathrooms'] = Number(bathrooms);
    if (furnishing) filter['features.furnishing'] = furnishing;
    
    if (amenities) {
      const amenitiesArray = (amenities as string).split(',');
      filter['features.amenities'] = { $all: amenitiesArray };
    }
    
    if (gender) filter['preferences.gender'] = gender;

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
        const newImages = req.files.map((file: Express.Multer.File) => ({
          url: `/uploads/properties/${file.filename}`,
          caption: ''
        }));
        images = [...images, ...newImages];
      }

      // Remove images if specified
      if (req.body.removeImages) {
        const removeImages = (req.body.removeImages as string).split(',');
        images = images.filter((image: any) => !removeImages.includes(image.url));
      }

      // Update property fields
      const propertyFields: any = {};
      for (const [key, value] of Object.entries(req.body)) {
        if (key !== 'removeImages') {
          // Handle nested objects
          if (key.includes('.')) {
            const [parent, child] = key.split('.');
            if (!propertyFields[parent]) propertyFields[parent] = {};
            propertyFields[parent][child] = value;
          } else {
            propertyFields[key] = value;
          }
        }
      }

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
      res.status(500).send('Server error');
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
    
    const user = await User.findById(req.user?.id);
    const propertyId = req.params.id;

    // Check if property exists
    const property = await Property.findById(propertyId);
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
      return res.json({ saved: true, savedProperties: user.savedProperties });
    }
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

export default router;