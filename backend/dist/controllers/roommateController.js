"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRoommates = void 0;
const User_1 = __importDefault(require("../models/User"));
const searchRoommates = async (req, res, next) => {
    try {
        const { minBudget, maxBudget, gender, food, occupation, search, page = 1, limit = 20 } = req.query;
        const filter = {
            isRoommateListed: true
        };
        // Budget Filter (checking user preferences)
        if (minBudget || maxBudget) {
            filter['preferences.budget.min'] = {};
            if (minBudget)
                filter['preferences.budget.min'].$gte = Number(minBudget);
        }
        // maxBudget: Show roommates whose minimum budget requirement is affordable
        // (i.e., the roommate's budget.min <= user's maxBudget)
        if (maxBudget && !isNaN(Number(maxBudget))) {
            filter['preferences.budget.min'] = filter['preferences.budget.min'] || {};
            filter['preferences.budget.min'].$lte = Number(maxBudget);
        }
        // Gender Filter
        if (gender && gender !== 'all') {
            filter.gender = gender;
        }
        // Occupation Filter
        if (occupation) {
            const occupations = occupation.split(',');
            if (occupations.length > 0) {
                filter.occupation = { $in: occupations };
            }
        }
        // Lifestyle Filters
        if (food && food !== 'all') {
            if (food === 'Veg')
                filter['personalLifestyle.food'] = 'Veg';
            // For non-veg, we might accept everything? Or strict? 
            // keeping simple: strict match
            if (food === 'Non-Veg')
                filter['personalLifestyle.food'] = 'Non-Veg';
        }
        // Search by Location Area
        if (search) {
            filter['preferences.location'] = { $elemMatch: { $regex: search, $options: 'i' } };
        }
        // Sorting
        let sortOption = { lastActive: -1 };
        const sortParam = req.query.sort || 'recommended';
        if (sortParam === 'newest') {
            sortOption = { createdAt: -1 };
        }
        else if (sortParam === 'budget_low') {
            sortOption = { 'preferences.budget.min': 1 };
        }
        else if (sortParam === 'budget_high') {
            sortOption = { 'preferences.budget.max': -1 };
        }
        const roommates = await User_1.default.find(filter)
            .select('name avatar gender dob occupation personalLifestyle preferences lastActive isPhoneVerified isIdVerified createdAt')
            .sort(sortOption)
            .skip((Number(page) - 1) * Number(limit))
            .limit(Number(limit));
        const total = await User_1.default.countDocuments(filter);
        // Transform data to match frontend expectation (calculating age)
        const transformedRoommates = roommates.map(user => {
            const age = user.dob ? new Date().getFullYear() - new Date(user.dob).getFullYear() : 0;
            return {
                id: user._id.toString(),
                name: user.name,
                age,
                gender: user.gender,
                image: user.avatar,
                activeStatus: `Active ${timeSince(new Date(user.lastActive))}`,
                budget: user.preferences?.budget || { min: 0, max: 0 },
                location: {
                    // Return first preferred location as primary
                    area: user.preferences?.location?.[0] || 'Anywhere',
                    city: 'Unknown'
                },
                preferences: {
                    food: user.personalLifestyle?.food,
                    smoking: user.personalLifestyle?.smoking,
                    drinking: user.personalLifestyle?.drinking,
                    occupation: user.occupation,
                    cleanliness: user.personalLifestyle?.cleanliness || 'Medium'
                },
                compatibilityScore: Math.floor(Math.random() * 20) + 80, // Mock score for now
                verification: {
                    phone: user.isPhoneVerified,
                    id: user.isIdVerified
                }
            };
        });
        res.json({
            roommates: transformedRoommates,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit))
        });
    }
    catch (err) {
        next(err);
    }
};
exports.searchRoommates = searchRoommates;
function timeSince(date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1)
        return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1)
        return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1)
        return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1)
        return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1)
        return Math.floor(interval) + "m ago";
    return "just now";
}
//# sourceMappingURL=roommateController.js.map