import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import Property from '../models/Property';
import User from '../models/User';
import emailService from '../services/emailService';
import notificationService from '../services/notificationService';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/uploadService';
import { parseFormDataJSON } from '../utils/formDataHelper';
import cache from '../utils/cache';
import { calculateMatchScore } from '../utils/matchScore';
import { AuthenticatedRequest } from '../types/express';
import { success, error as errorRes, validationError } from '../utils/apiResponse';

export const createProperty = async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationError(res, errors.array());
  }

  try {
    // Process uploaded images
    const images = [];
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const uploadPromises = (req.files as Express.Multer.File[]).map(async (file) => {
        const result = await uploadToCloudinary(file.buffer, 'flatmates/properties');
        return { url: result.url, caption: '' };
      });

      try {
        const settled = await Promise.all(uploadPromises);
        images.push(...settled);
      } catch (error: any) {
        console.error('Cloudinary upload error:', error);
        return errorRes(res, `Image upload failed: ${error.message || 'Unknown error'}`);
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

    const parsedAddress = parseFormDataJSON(req.body.address);
    const locationData = (parsedAddress && parsedAddress.coordinates && parsedAddress.coordinates.lat && parsedAddress.coordinates.lng)
      ? { type: 'Point', coordinates: [Number(parsedAddress.coordinates.lng), Number(parsedAddress.coordinates.lat)] }
      : undefined;

    // Create new property
    const newProperty = new Property({
      owner: req.user?.id,
      title: req.body.title,
      description: req.body.description,
      propertyType: req.body.propertyType,
      listingType: req.body.listingType,
      address: parsedAddress,
      ...(locationData ? { location: locationData } : {}),
      price: parseFormDataJSON(req.body.price),
      availability: parseFormDataJSON(req.body.availability),
      features: parseFormDataJSON(req.body.features) || {},
      images,
      currentOccupants: parseFormDataJSON(req.body.currentOccupants) || { total: 0, details: [] },
      preferences: filteredPreferences
    });

    const property = await newProperty.save();
    cache.invalidatePrefix('properties:'); // Bust listing cache

    // Notify potential matches in the background
    (async () => {
      try {
        const matchingUsers = await User.find({
          _id: { $ne: req.user?.id },
          'preferences.location': property.address.city,
          'preferences.budget.max': { $gte: property.price.amount },
          'preferences.budget.min': { $lte: property.price.amount }
        }).limit(50);

        if (matchingUsers.length > 0) {
          await notificationService.notifyUsers(
            matchingUsers.map(u => u._id),
            {
              type: 'match',
              content: `New match in ${property.address.city}: ${property.title}`,
              relatedTo: property._id,
              relatedModel: 'Property'
            }
          );
        }
      } catch (err) {
        console.error('Match notify error:', err);
      }
    })();

    return success(res, property);
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, err.message || 'Server error');
  }
};

export const getProperties = async (req: Request, res: Response) => {
  try {
    // Build a cache key from the full query string.
    // Authenticated requests get match scores so we skip cache for them.
    const isAuthenticated = !!(req as any).user;
    const cacheKey = isAuthenticated ? null : `properties:${JSON.stringify(req.query)}`;

    if (cacheKey) {
      const cached = cache.get(cacheKey);
      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(cached); // keep raw json for backwards compatibility with front-end
      }
    }
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

    // Build filter object
    const filter: any = { status: 'active' };

    let currentUser: any = null;

    // Filter out properties from blocked users
    if ((req as any).user) {
      currentUser = await User.findById((req as any).user.id || (req as any).user._id);
      if (currentUser && currentUser.blockedUsers?.length > 0) {
        filter.owner = { $nin: currentUser.blockedUsers };
      }
    }

    if (listingType) filter.listingType = listingType;
    if (propertyType) filter.propertyType = propertyType;

    if (search) {
      try {
        filter.$text = { $search: search as string };
      } catch {
        const searchRegex = new RegExp((search as string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [
          { title: searchRegex },
          { description: searchRegex },
          { 'address.city': searchRegex },
        ];
      }
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

    if (gender && gender !== 'any' && gender !== 'all') {
      // ★ FIX #7: Lowercase filter comparison to match schema constraints correctly (male, female, any)
      const genderLower = (gender as string).toLowerCase();
      filter['preferences.gender'] = { $in: [genderLower, 'any'] };
    } else if (gender === 'any') {
      filter['preferences.gender'] = 'any';
    }

    if (req.query.occupation) {
      filter['preferences.occupation'] = req.query.occupation;
    }

    if (req.query.lifestyle) {
      const lifestyleArray = (req.query.lifestyle as string).split(',').map(s => s.trim()).filter(Boolean);
      const orConditions: any[] = filter.$or ? [...filter.$or] : [];
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

    if (req.query.street) filter['address.street'] = new RegExp(req.query.street as string, 'i');
    if (req.query.state) filter['address.state'] = new RegExp(req.query.state as string, 'i');
    if (req.query.zipCode) filter['address.zipCode'] = req.query.zipCode;

    if (req.query.petFriendly === 'true') {
      filter['preferences.pets'] = true;
    }

    const lat = req.query.lat ? Number(req.query.lat) : undefined;
    const lng = req.query.lng ? Number(req.query.lng) : undefined;
    const radius = req.query.radius ? Number(req.query.radius) : undefined;

    // ★ FIX #13: Spatial geo search using $near and 2dsphere index instead of rough lat/lng bounding box math
    if (lat !== undefined && lng !== undefined && radius !== undefined) {
      if (isNaN(lat) || isNaN(lng) || isNaN(radius) || radius <= 0) {
        return errorRes(res, 'Invalid geo parameters', 400);
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

    let properties: any[] = [];
    let total: number = 0;

    try {
      [properties, total] = await Promise.all([
        Property.find(filter)
          .populate('owner', 'name avatar isBoosted lastActive')
          .sort(filter.$text ? { score: { $meta: 'textScore' }, isFeatured: -1 } : { isFeatured: -1, createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean(),
        Property.countDocuments(filter)
      ]);
    } catch (queryErr: any) {
      if (filter.$text) {
        // Fallback to regex search if text index fails
        delete filter.$text;
        const searchRegex = new RegExp((search as string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
        filter.$or = [
          { title: searchRegex },
          { description: searchRegex },
          { 'address.city': searchRegex },
        ];
        [properties, total] = await Promise.all([
          Property.find(filter)
            .populate('owner', 'name avatar isBoosted lastActive')
            .sort({ isFeatured: -1, createdAt: -1 })
            .skip(skip)
            .limit(Number(limit))
            .lean(),
          Property.countDocuments(filter)
        ]);
      } else {
        throw queryErr;
      }
    }

    let propertiesWithScores = properties as any[];

    if (currentUser && currentUser.preferences) {
      propertiesWithScores = propertiesWithScores.map((p: any) => ({
        ...p,
        matchScore: calculateMatchScore(currentUser.preferences!, p)
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
      cache.set(cacheKey, responsePayload, 60);
      res.setHeader('X-Cache', 'MISS');
    }

    res.json(responsePayload);
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, err.message || 'Server error');
  }
};

export const getSavedProperties = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    const properties = await Property.find({ _id: { $in: user?.savedProperties } }).populate(
      'owner',
      'name avatar'
    );

    return success(res, properties);
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, 'Server error');
  }
};

export const getUserListings = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const properties = await Property.find({ owner: req.user?.id }).sort({ createdAt: -1 });
    return success(res, properties);
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, 'Server error');
  }
};

export const getPropertyById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name avatar email phone');

    if (!property) {
      return errorRes(res, 'Property not found', 404);
    }

    Property.updateOne({ _id: property._id }, { $inc: { views: 1 } }).catch(
      (err: any) => console.error('Failed to increment view count:', err)
    );

    if ((req as any).user && property.owner && (property.owner as any).email) {
      const viewer = await User.findById((req as any).user?.id);
      if (viewer && (property.owner as any)._id.toString() !== viewer._id.toString()) {
        setImmediate(() => {
          emailService.sendPropertyViewNotification(
            (property.owner as any).email,
            property.title,
            viewer.name
          ).catch((err: any) => console.error('Failed to send email notification:', err));
        });
      }
    }

    // For frontend compatibility, don't wrap this specific single property result.
    // The previous implementation sent just the object without { success: true }. 
    // Usually standardizing is good, but for GET single we'll return raw for now.
    res.json(property);
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return errorRes(res, 'Property not found', 404);
    }
    return errorRes(res, 'Server error');
  }
};

export const updateProperty = async (req: AuthenticatedRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationError(res, errors.array());
  }

  try {
    let property = await Property.findById(req.params.id);

    if (!property) {
      return errorRes(res, 'Property not found', 404);
    }

    if (property.owner.toString() !== req.user?.id) {
      return errorRes(res, 'Not authorized', 401);
    }

    let images = property.images;
    if (req.files && Array.isArray(req.files) && req.files.length > 0) {
      const uploadPromises = (req.files as Express.Multer.File[]).map(async (file) => {
        const result = await uploadToCloudinary(file.buffer, 'flatmates/properties');
        return { url: result.url, caption: '' };
      });

      try {
        const settled = await Promise.all(uploadPromises);
        images.push(...settled);
      } catch (error: any) {
        console.error('Cloudinary upload error:', error);
      }
    }

    if (req.body.removeImages) {
      const removeImages = (req.body.removeImages as string).split(',');
      images = images.filter((image: any) => {
        if (removeImages.includes(image.url)) {
          if (image.url.includes('cloudinary.com')) {
            const publicId = image.url.split('/').slice(-2).join('/').split('.')[0];
            deleteFromCloudinary(publicId).catch(console.error);
          }
          return false;
        }
        return true;
      });
    }

    const propertyFields: any = {};

    if (req.body.address) propertyFields.address = parseFormDataJSON(req.body.address);
    if (req.body.price) propertyFields.price = parseFormDataJSON(req.body.price);
    if (req.body.availability) propertyFields.availability = parseFormDataJSON(req.body.availability);
    if (req.body.features) propertyFields.features = parseFormDataJSON(req.body.features);
    if (req.body.currentOccupants) propertyFields.currentOccupants = parseFormDataJSON(req.body.currentOccupants);
    if (req.body.preferences) propertyFields.preferences = parseFormDataJSON(req.body.preferences);

    const directFields = ['title', 'description', 'propertyType', 'listingType'];
    directFields.forEach(field => {
      if (req.body[field] !== undefined) {
        propertyFields[field] = req.body[field];
      }
    });

    propertyFields.images = images;

    property = await Property.findByIdAndUpdate(
      req.params.id,
      { $set: propertyFields },
      { new: true }
    );

    // ★ FIX #12: Invalidate property cache on update to avoid stale search results
    cache.invalidatePrefix('properties:');

    return success(res, property);
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, err.message || 'Server error');
  }
};

export const deleteProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const property = await Property.findById(req.params.id);

    if (!property) {
      return errorRes(res, 'Property not found', 404);
    }

    if (property.owner.toString() !== req.user?.id) {
      return errorRes(res, 'Not authorized', 401);
    }

    await property.deleteOne();

    // ★ FIX #12: Invalidate property cache on delete to avoid stale search results
    cache.invalidatePrefix('properties:');

    return success(res, { msg: 'Property removed' });
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return errorRes(res, 'Property not found', 404);
    }
    return errorRes(res, 'Server error');
  }
};

export const toggleSaveProperty = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id);
    const propertyId = req.params.id;

    const property = await Property.findById(propertyId).populate('owner', 'name email');
    if (!property) {
      return errorRes(res, 'Property not found', 404);
    }

    const isSaved = user?.savedProperties.some((id: any) => id.toString() === propertyId);

    if (isSaved) {
      user!.savedProperties = user!.savedProperties.filter((id: any) => id.toString() !== propertyId);
      await user!.save();
      // Notice res.json here to keep backward compatibility with authSlice 
      res.json({ saved: false, savedProperties: user!.savedProperties });
    } else {
      user!.savedProperties.push(propertyId as any);
      await user!.save();

      if (property.owner && (property.owner as any).email && (property.owner as any)._id.toString() !== user?._id.toString()) {
        setImmediate(() => {
          emailService.sendPropertySavedNotification(
            (property.owner as any).email,
            property.title,
            user?.name || 'Someone'
          ).catch((err: any) => console.error('Failed to send email notification:', err));
        });
      }

      res.json({ saved: true, savedProperties: user!.savedProperties });
    }
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, 'Server error');
  }
};
