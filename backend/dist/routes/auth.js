"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const express_2 = require("../types/express");
const authController_1 = require("../controllers/authController");
const router = express_1.default.Router();
// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', [
    (0, express_validator_1.check)('name', 'Name is required').not().isEmpty(),
    (0, express_validator_1.check)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.check)('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
], authController_1.register);
// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', [
    (0, express_validator_1.check)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.check)('password', 'Password is required').exists().not().isEmpty()
], authController_1.login);
// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', auth_1.protect, (0, express_2.wrapHandler)(authController_1.getUser));
// @route   PUT api/auth/complete-profile
// @desc    Complete user profile after social login
// @access  Private
router.put('/complete-profile', auth_1.protect, (0, express_2.wrapHandler)(authController_1.completeProfile));
// @route   POST api/auth/forgot-password
// @desc    Send OTP to email for password reset
// @access  Public
router.post('/forgot-password', [(0, express_validator_1.check)('email', 'Please include a valid email').isEmail()], authController_1.forgotPassword);
// @route   POST api/auth/verify-otp
// @desc    Verify OTP code
// @access  Public
router.post('/verify-otp', [
    (0, express_validator_1.check)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.check)('otp', 'OTP is required').not().isEmpty()
], authController_1.verifyOtp);
// @route   POST api/auth/reset-password
// @desc    Reset password with OTP
// @access  Public
router.post('/reset-password', [
    (0, express_validator_1.check)('email', 'Please include a valid email').isEmail(),
    (0, express_validator_1.check)('otp', 'OTP is required').not().isEmpty(),
    (0, express_validator_1.check)('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
], authController_1.resetPassword);
exports.default = router;
//# sourceMappingURL=auth.js.map