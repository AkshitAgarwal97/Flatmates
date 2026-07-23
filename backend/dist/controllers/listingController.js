"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNearby = exports.getListings = void 0;
const Listing_1 = __importDefault(require("../models/Listing"));
/** Helper to split CSV query param into array */
const csvToArray = (value) => value ? value.split(',').map(v => v.trim()) : undefined;
const getListings = async (req, res, next) => {
    try {
        const { available_from, pet_friendly, lifestyle, amenities, bbox, lat, lng, radius, page = 1, limit = 20, } = req.query;
        const filter = {};
        if (available_from)
            filter.availableFrom = { $gte: new Date(available_from) };
        if (pet_friendly !== undefined)
            filter.petFriendly = pet_friendly === 'true';
        if (lifestyle)
            filter.lifestyle = { $in: csvToArray(lifestyle) };
        if (amenities)
            filter.amenities = { $all: csvToArray(amenities) };
        // Geo filters ---------------------------------------------------
        if (bbox) {
            const [minLon, minLat, maxLon, maxLat] = bbox.split(',').map(Number);
            filter.coordinates = {
                $geoWithin: {
                    $box: [
                        [minLon, minLat],
                        [maxLon, maxLat],
                    ],
                },
            };
        }
        else if (lat && lng && radius) {
            // $geoNear aggregation pipeline
            const pipeline = [
                {
                    $geoNear: {
                        near: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
                        distanceField: 'dist.calculated',
                        maxDistance: Number(radius) * 1000,
                        spherical: true,
                        query: filter,
                    },
                },
                { $skip: (page - 1) * limit },
                { $limit: Number(limit) },
            ];
            const listings = await Listing_1.default.aggregate(pipeline);
            const total = await Listing_1.default.countDocuments(filter);
            return res.json({ listings, page, totalPages: Math.ceil(total / limit) });
        }
        // Regular query ------------------------------------------------
        const listings = await Listing_1.default.find(filter)
            .skip((page - 1) * limit)
            .limit(Number(limit));
        const total = await Listing_1.default.countDocuments(filter);
        res.json({ listings, page, totalPages: Math.ceil(total / limit) });
    }
    catch (err) {
        next(err);
    }
};
exports.getListings = getListings;
const getNearby = async (req, res, next) => {
    try {
        const { lat, lng, radius = 5 } = req.query;
        const pipeline = [
            {
                $geoNear: {
                    near: { type: 'Point', coordinates: [Number(lng), Number(lat)] },
                    distanceField: 'dist',
                    maxDistance: Number(radius) * 1000,
                    spherical: true,
                },
            },
            { $project: { _id: 1, title: 1, coordinates: 1, dist: 1 } },
        ];
        const points = await Listing_1.default.aggregate(pipeline);
        res.json({ points });
    }
    catch (err) {
        next(err);
    }
};
exports.getNearby = getNearby;
//# sourceMappingURL=listingController.js.map