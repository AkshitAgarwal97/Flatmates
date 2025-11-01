"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
    (0, express_validator_1.check)('name', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.check)('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
    (0, express_validator_1.check)('userType', 'User type is required').isIn([
        'room_seeker',
        'roommate_seeker',
        'broker_dealer',
        'property_owner'
    ])
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password, userType } = req.body;
    try {
        // Import User model dynamically to avoid circular dependencies
        const User = require('../models/User').default;
        // Check if user exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }
        user = new User({
            name,
            email,
            password,
            userType,
            socialProvider: 'local'
        });
        // Encrypt password
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(password, salt);
        await user.save();
        // Return jsonwebtoken
        const payload = {
            id: user.id,
            userType: user.userType
        };
        jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' }, (err, token) => {
            if (err)
                throw err;
            res.json({ token });
        });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
    (0, express_validator_1.check)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.check)('password', 'Password is required').exists()
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, password } = req.body;
    try {
        // Import User model dynamically to avoid circular dependencies
        const User = require('../models/User').default;
        // Check if user exists
        let user = await User.findOne({ email, socialProvider: 'local' });
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
        }
        // Check password
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
        }
        // Return jsonwebtoken
        const payload = {
            id: user.id,
            userType: user.userType
        };
        jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' }, (err, token) => {
            if (err)
                throw err;
            res.json({ token });
        });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', passport_1.default.authenticate('jwt', { session: false }), async (req, res) => {
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
// @route   GET api/auth/google
// @desc    Google OAuth login
// @access  Public
router.get('/google', passport_1.default.authenticate('google', { scope: ['profile', 'email'] }));
// @route   GET api/auth/google/callback
// @desc    Google OAuth callback
// @access  Public
router.get('/google/callback', passport_1.default.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login` }), (req, res) => {
    // Successful authentication
    const payload = {
        id: req.user?.id,
        userType: req.user?.userType
    };
    jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' }, (err, token) => {
        if (err)
            throw err;
        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/success?token=${token}`);
    });
});
// @route   GET api/auth/facebook
// @desc    Facebook OAuth login
// @access  Public
router.get('/facebook', passport_1.default.authenticate('facebook', { scope: ['email'] }));
// @route   GET api/auth/facebook/callback
// @desc    Facebook OAuth callback
// @access  Public
router.get('/facebook/callback', passport_1.default.authenticate('facebook', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login` }), (req, res) => {
    // Successful authentication
    const payload = {
        id: req.user?.id,
        userType: req.user?.userType
    };
    jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' }, (err, token) => {
        if (err)
            throw err;
        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/success?token=${token}`);
    });
});
// @route   GET api/auth/instagram
// @desc    Instagram OAuth login
// @access  Public
router.get('/instagram', passport_1.default.authenticate('instagram'));
// @route   GET api/auth/instagram/callback
// @desc    Instagram OAuth callback
// @access  Public
router.get('/instagram/callback', passport_1.default.authenticate('instagram', { failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:3000'}/login` }), (req, res) => {
    // Successful authentication
    const payload = {
        id: req.user?.id,
        userType: req.user?.userType
    };
    jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' }, (err, token) => {
        if (err)
            throw err;
        // Redirect to frontend with token
        res.redirect(`${process.env.CLIENT_URL || 'http://localhost:3000'}/auth/success?token=${token}`);
    });
});
// @route   PUT api/auth/complete-profile
// @desc    Complete user profile after social login
// @access  Private
router.put('/complete-profile', [
    passport_1.default.authenticate('jwt', { session: false }),
    (0, express_validator_1.check)('userType', 'User type is required').isIn([
        'room_seeker',
        'roommate_seeker',
        'broker_dealer',
        'property_owner'
    ])
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Import User model dynamically to avoid circular dependencies
        const User = require('../models/User').default;
        const { userType, phone, bio, preferences } = req.body;
        // Update user profile
        const user = await User.findById(req.user?.id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        user.userType = userType;
        if (phone)
            user.phone = phone;
        if (bio)
            user.bio = bio;
        if (preferences)
            user.preferences = preferences;
        await user.save();
        res.json(user);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map