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
exports.resetPassword = exports.verifyOtp = exports.forgotPassword = exports.completeProfile = exports.getUser = exports.login = exports.register = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const express_validator_1 = require("express-validator");
const User_1 = __importDefault(require("../models/User"));
const OTP_1 = __importDefault(require("../models/OTP"));
const emailService_1 = __importDefault(require("../services/emailService"));
const apiResponse_1 = require("../utils/apiResponse");
const security_1 = require("../utils/security");
const register = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return (0, apiResponse_1.validationError)(res, errors.array());
    }
    const { name, email, password: encryptedPassword } = req.body;
    const password = (0, security_1.decryptData)(encryptedPassword);
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
            socialProvider: 'local'
        });
        // Encrypt password
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(password, salt);
        await user.save();
        // Send welcome email asynchronously (fire-and-forget)
        try {
            setImmediate(() => {
                emailService_1.default.sendWelcomeEmail(user.email, user.name).catch((err) => console.error('Failed to send welcome email:', err));
            });
        }
        catch (e) {
            console.error('Failed to schedule welcome email send:', e);
        }
        // Return jsonwebtoken
        const payload = {
            id: user.id
        };
        jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' }, (err, token) => {
            if (err)
                throw err;
            // Not using success() helper here to maintain exactly the same frontend payload for auth
            res.json({
                token,
                user: {
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    needsProfileCompletion: user.needsProfileCompletion
                }
            });
        });
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.register = register;
const login = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return (0, apiResponse_1.validationError)(res, errors.array());
    }
    const { email, password: encryptedPassword } = req.body;
    const password = (0, security_1.decryptData)(encryptedPassword);
    // Strict validation: Ensure password is not empty after decryption
    if (!password || password.trim() === '') {
        return res.status(400).json({ errors: [{ msg: 'Password is required', type: 'INVALID_PASSWORD' }] });
    }
    try {
        // Check if user exists
        let user = await User_1.default.findOne({ email });
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
            id: user.id
        };
        jsonwebtoken_1.default.sign(payload, process.env.JWT_SECRET || 'your_jwt_secret', { expiresIn: '7d' }, (err, token) => {
            if (err)
                throw err;
            res.json({
                token,
                user: {
                    _id: user.id,
                    name: user.name,
                    email: user.email,
                    needsProfileCompletion: user.needsProfileCompletion
                }
            });
        });
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.login = login;
const getUser = async (req, res) => {
    try {
        const authReq = req;
        const user = await User_1.default.findById(authReq.user?.id).select('-password');
        // Keeping this res.json for backwards compatibility unless we want to refactor frontend
        res.json(user);
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.getUser = getUser;
const completeProfile = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return (0, apiResponse_1.validationError)(res, errors.array());
    }
    try {
        const { phone, bio, preferences } = req.body;
        // Update user profile
        const authReq = req;
        const user = await User_1.default.findById(authReq.user?.id);
        if (!user) {
            return (0, apiResponse_1.error)(res, 'User not found', 404);
        }
        if (phone)
            user.phone = phone;
        if (bio)
            user.bio = bio;
        if (preferences)
            user.preferences = preferences;
        user.needsProfileCompletion = false;
        await user.save();
        res.json(user);
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.completeProfile = completeProfile;
const forgotPassword = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return (0, apiResponse_1.validationError)(res, errors.array());
    }
    const { email } = req.body;
    try {
        const { generateOTP, sendOTPEmail } = await Promise.resolve().then(() => __importStar(require('../services/emailService')));
        const user = await User_1.default.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ errors: [{ msg: 'User not found' }] });
        }
        const otp = generateOTP();
        await OTP_1.default.deleteMany({ email: email.toLowerCase() });
        const otpDoc = new OTP_1.default({ email: email.toLowerCase(), otp });
        await otpDoc.save();
        await sendOTPEmail(email, otp);
        return (0, apiResponse_1.success)(res, { message: 'OTP sent to your email' });
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.forgotPassword = forgotPassword;
const verifyOtp = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return (0, apiResponse_1.validationError)(res, errors.array());
    }
    const { email, otp } = req.body;
    try {
        const otpDoc = await OTP_1.default.findOne({ email: email.toLowerCase(), otp });
        if (!otpDoc) {
            return res.status(400).json({ errors: [{ msg: 'Invalid or expired OTP' }] });
        }
        return (0, apiResponse_1.success)(res, { message: 'OTP verified successfully' });
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.verifyOtp = verifyOtp;
const resetPassword = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return (0, apiResponse_1.validationError)(res, errors.array());
    }
    const { email, otp, password: encryptedPassword } = req.body;
    const password = (0, security_1.decryptData)(encryptedPassword);
    try {
        const otpDoc = await OTP_1.default.findOne({ email: email.toLowerCase(), otp });
        if (!otpDoc) {
            return res.status(400).json({ errors: [{ msg: 'Invalid or expired OTP' }] });
        }
        const user = await User_1.default.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ errors: [{ msg: 'User not found' }] });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        user.password = await bcryptjs_1.default.hash(password, salt);
        await user.save();
        await OTP_1.default.deleteOne({ _id: otpDoc._id });
        return (0, apiResponse_1.success)(res, { message: 'Password reset successfully' });
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.resetPassword = resetPassword;
//# sourceMappingURL=authController.js.map