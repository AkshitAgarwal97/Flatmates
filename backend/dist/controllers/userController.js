"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportUser = exports.blockUser = exports.verifyUserAttribute = exports.markNotificationRead = exports.getNotifications = exports.getUsers = exports.getUserById = exports.updateCurrentUser = exports.getCurrentUser = void 0;
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const Conversation_1 = __importDefault(require("../models/Conversation"));
const Report_1 = __importDefault(require("../models/Report"));
const apiResponse_1 = require("../utils/apiResponse");
const uploadService_1 = require("../services/uploadService");
const getCurrentUser = async (req, res) => {
    try {
        const authReq = req;
        const user = await User_1.default.findById(authReq.user?.id).select('-password');
        return (0, apiResponse_1.success)(res, user);
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.getCurrentUser = getCurrentUser;
const updateCurrentUser = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return (0, apiResponse_1.validationError)(res, errors.array());
    }
    try {
        const { name, email, phone, bio, preferences } = req.body;
        // Build profile object
        const profileFields = {};
        if (name)
            profileFields.name = name;
        if (email)
            profileFields.email = email;
        if (phone)
            profileFields.phone = phone;
        if (bio)
            profileFields.bio = bio;
        if (preferences)
            profileFields.preferences = preferences;
        const authReq = req;
        let user = await User_1.default.findById(authReq.user?.id);
        if (!user)
            return (0, apiResponse_1.error)(res, 'User not found', 404);
        // Handle avatar upload
        if (req.file) {
            if (user.avatar?.includes('cloudinary.com')) {
                const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
                (0, uploadService_1.deleteFromCloudinary)(publicId).catch(console.error);
            }
            const result = await (0, uploadService_1.uploadToCloudinary)(req.file.buffer, 'flatmates/avatars');
            profileFields.avatar = result.url;
        }
        // Update user
        const updatedUser = await User_1.default.findByIdAndUpdate(authReq.user?.id, { $set: profileFields }, { new: true }).select('-password');
        return (0, apiResponse_1.success)(res, updatedUser);
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.updateCurrentUser = updateCurrentUser;
const getUserById = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select('-password -notifications');
        if (!user) {
            return (0, apiResponse_1.error)(res, 'User not found', 404);
        }
        const userObj = user.toObject();
        // Privacy: Hide phone number unless mutual interest (contact shared by both)
        const authUser = req.user;
        if (authUser && authUser.id !== userObj._id.toString()) {
            const conversation = await Conversation_1.default.findOne({
                participants: { $all: [authUser.id, userObj._id] },
                contactSharedBy: { $all: [authUser.id, userObj._id] }
            });
            if (!conversation) {
                delete userObj.phone;
            }
        }
        else if (!authUser) {
            delete userObj.phone;
        }
        return (0, apiResponse_1.success)(res, userObj);
    }
    catch (err) {
        console.error(`[GET api/users/:id] Error fetching user ${req.params.id}:`, err.message);
        if (err.name === 'CastError' || err.kind === 'ObjectId') {
            return (0, apiResponse_1.error)(res, 'User not found', 404);
        }
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.getUserById = getUserById;
const getUsers = async (req, res) => {
    try {
        const { city, search, page = 1, limit = 10 } = req.query;
        // Build filter object
        const filter = {};
        if (city)
            filter['preferences.location'] = new RegExp(city, 'i');
        if (search) {
            filter.$or = [
                { name: new RegExp(search, 'i') },
                { bio: new RegExp(search, 'i') }
            ];
        }
        // Pagination
        const skip = (Number(page) - 1) * Number(limit);
        const users = await User_1.default.find(filter)
            .select('-password -notifications')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await User_1.default.countDocuments(filter);
        // Keep this shape as some frontends expect it exactly, but wrap in success if applicable.
        // However, existing endpoints sometimes returned raw json. Using success() adds `{ success: true, data: ... }` wrapper
        // which might break frontend. I will use res.json for complex pagination objects to avoid breaking frontend unless frontend is adapted.
        // Let's use res.json for `getUsers` to ensure backwards compatibility with Redux store if it's strictly checking this shape.
        res.json({
            users,
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
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.getUsers = getUsers;
const getNotifications = async (req, res) => {
    try {
        const authReq = req;
        const user = await User_1.default.findById(authReq.user?.id).select('notifications');
        // Keeping res.json for exact backward compatibility on arrays
        res.json(user?.notifications || []);
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.getNotifications = getNotifications;
const markNotificationRead = async (req, res) => {
    try {
        const authReq = req;
        const user = await User_1.default.findById(authReq.user?.id);
        if (!user) {
            return (0, apiResponse_1.error)(res, 'User not found', 404);
        }
        const notification = user.notifications.find((n) => n._id?.toString() === req.params.id);
        if (!notification) {
            return (0, apiResponse_1.error)(res, 'Notification not found', 404);
        }
        notification.read = true;
        await user.save();
        res.json({ msg: 'Notification marked as read' });
    }
    catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return (0, apiResponse_1.error)(res, 'Notification not found', 404);
        }
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.markNotificationRead = markNotificationRead;
const verifyUserAttribute = async (req, res) => {
    try {
        const { type } = req.params;
        const allowedTypes = ['email', 'phone', 'id'];
        if (!allowedTypes.includes(type)) {
            return (0, apiResponse_1.error)(res, 'Invalid verification type', 400);
        }
        const authReq = req;
        const user = await User_1.default.findById(authReq.user?.id);
        if (!user) {
            return (0, apiResponse_1.error)(res, 'User not found', 404);
        }
        if (type === 'email')
            user.isEmailVerified = true;
        if (type === 'phone')
            user.isPhoneVerified = true;
        if (type === 'id')
            user.isIdVerified = true;
        await user.save();
        res.json(user);
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.verifyUserAttribute = verifyUserAttribute;
const blockUser = async (req, res) => {
    try {
        const authReq = req;
        const user = await User_1.default.findById(authReq.user?.id);
        const targetId = req.params.userId;
        if (!user)
            return (0, apiResponse_1.error)(res, 'User not found', 404);
        if (user._id.toString() === targetId)
            return (0, apiResponse_1.error)(res, 'Cannot block yourself', 400);
        // ★ FIX #10: Always check block list using string comparisons as mongoose.Types.ObjectId !== string
        const isBlocked = user.blockedUsers.some(id => id.toString() === targetId);
        if (isBlocked) {
            user.blockedUsers = user.blockedUsers.filter((id) => id.toString() !== targetId);
        }
        else {
            user.blockedUsers.push(targetId);
        }
        await user.save();
        res.json({ blockedUsers: user.blockedUsers });
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.blockUser = blockUser;
const reportUser = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty())
        return (0, apiResponse_1.validationError)(res, errors.array());
    try {
        const { targetUser, targetProperty, reason, description } = req.body;
        const authReq = req;
        const report = new Report_1.default({
            reporter: authReq.user?.id,
            targetUser,
            targetProperty,
            reason,
            description
        });
        await report.save();
        res.json({ msg: 'Report submitted successfully' });
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.reportUser = reportUser;
//# sourceMappingURL=userController.js.map