"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const passport_1 = __importDefault(require("passport"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
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
        // Check if user exists
        let user = await User_1.default.findOne({ email });
        if (user) {
            return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
        }
        user = new User_1.default({
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
        // Check if user exists
        let user = await User_1.default.findOne({ email, socialProvider: 'local' });
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'User not found', type: 'USER_NOT_FOUND' }] });
        }
        // Check password
        const isMatch = await bcryptjs_1.default.compare(password, user.password || '');
        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid password', type: 'INVALID_PASSWORD' }] });
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
        const user = await User_1.default.findById(req.user?.id).select('-password');
        res.json(user);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
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
        const { userType, phone, bio, preferences } = req.body;
        // Update user profile
        const user = await User_1.default.findById(req.user?.id);
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
// @route   POST api/auth/forgot-password
// @desc    Send OTP to email for password reset
// @access  Public
router.post('/forgot-password', [(0, express_validator_1.check)('email', 'Please include a valid email').isEmail()], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email } = req.body;
    try {
        const User = (await Promise.resolve().then(() => __importStar(require('../models/User')))).default;
        const OTP = (await Promise.resolve().then(() => __importStar(require('../models/OTP')))).default;
        const { generateOTP, sendOTPEmail } = await Promise.resolve().then(() => __importStar(require('../utils/emailService')));
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ errors: [{ msg: 'User not found' }] });
        }
        const otp = generateOTP();
        await OTP.deleteMany({ email: email.toLowerCase() });
        const otpDoc = new OTP({ email: email.toLowerCase(), otp });
        await otpDoc.save();
        await sendOTPEmail(email, otp);
        res.json({ msg: 'OTP sent to your email' });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   POST api/auth/verify-otp
// @desc    Verify OTP code
// @access  Public
router.post('/verify-otp', [
    (0, express_validator_1.check)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.check)('otp', 'OTP is required').not().isEmpty()
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, otp } = req.body;
    try {
        const OTP = (await Promise.resolve().then(() => __importStar(require('../models/OTP')))).default;
        const otpDoc = await OTP.findOne({ email: email.toLowerCase(), otp });
        if (!otpDoc) {
            return res.status(400).json({ errors: [{ msg: 'Invalid or expired OTP' }] });
        }
        res.json({ msg: 'OTP verified successfully' });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   POST api/auth/reset-password
// @desc    Reset password with OTP
// @access  Public
router.post('/reset-password', [
    (0, express_validator_1.check)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.check)('otp', 'OTP is required').not().isEmpty(),
    (0, express_validator_1.check)('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const { email, otp, password } = req.body;
    try {
        const User = (await Promise.resolve().then(() => __importStar(require('../models/User')))).default;
        const OTP = (await Promise.resolve().then(() => __importStar(require('../models/OTP')))).default;
        const otpDoc = await OTP.findOne({ email: email.toLowerCase(), otp });
        if (!otpDoc) {
            return res.status(400).json({ errors: [{ msg: 'Invalid or expired OTP' }] });
        }
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ errors: [{ msg: 'User not found' }] });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(password, salt);
        await user.save();
        await OTP.deleteOne({ _id: otpDoc._id });
        res.json({ msg: 'Password reset successfully' });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map