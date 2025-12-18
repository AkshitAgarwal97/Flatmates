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
// Set up multer for avatar uploads
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/avatars/');
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5000000 }, // 5MB limit
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
// @route   GET api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', passport_1.default.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Import User model dynamically to avoid circular dependencies
        const User = require('../models/User').default;
        const user = await User.findById(req.user?.id).select('-password');
        res.json(user);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   PUT api/users/me
// @desc    Update current user profile
// @access  Private
router.put('/me', [
    passport_1.default.authenticate('jwt', { session: false }),
    upload.single('avatar'),
    (0, express_validator_1.check)('name', 'Name is required').optional().not().isEmpty(),
    (0, express_validator_1.check)('email', 'Please include a valid email').optional().isEmail(),
    (0, express_validator_1.check)('phone', 'Please include a valid phone number').optional().isMobilePhone('any')
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Import User model dynamically to avoid circular dependencies
        const User = require('../models/User').default;
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
        // Handle avatar upload
        if (req.file) {
            profileFields.avatar = `/uploads/avatars/${req.file.filename}`;
        }
        // Update user
        const user = await User.findByIdAndUpdate(req.user?.id, { $set: profileFields }, { new: true }).select('-password');
        res.json(user);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        // Import User model dynamically to avoid circular dependencies
        const User = require('../models/User').default;
        const user = await User.findById(req.params.id).select('-password -notifications');
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    }
    catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.status(500).send('Server error');
    }
});
// @route   GET api/users
// @desc    Get all users with filters
// @access  Public
router.get('/', async (req, res) => {
    try {
        const { userType, city, search, page = 1, limit = 10 } = req.query;
        // Import User model dynamically to avoid circular dependencies
        const User = require('../models/User').default;
        // Build filter object
        const filter = {};
        if (userType)
            filter.userType = userType;
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
        const users = await User.find(filter)
            .select('-password -notifications')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await User.countDocuments(filter);
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
        res.status(500).send('Server error');
    }
});
// @route   GET api/users/me/notifications
// @desc    Get user notifications
// @access  Private
router.get('/me/notifications', passport_1.default.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Import User model dynamically to avoid circular dependencies
        const User = require('../models/User').default;
        const user = await User.findById(req.user?.id).select('notifications');
        res.json(user?.notifications || []);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   PUT api/users/notifications/:id
// @desc    Mark notification as read
// @access  Private
router.put('/notifications/:id', passport_1.default.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Import User model dynamically to avoid circular dependencies
        const User = require('../models/User').default;
        const user = await User.findById(req.user?.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        // Find and update the notification
        const notification = user.notifications.id(req.params.id);
        if (!notification) {
            return res.status(404).json({ msg: 'Notification not found' });
        }
        notification.read = true;
        await user.save();
        res.json({ msg: 'Notification marked as read' });
    }
    catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Notification not found' });
        }
        res.status(500).send('Server error');
    }
});
exports.default = router;
//# sourceMappingURL=users.js.map