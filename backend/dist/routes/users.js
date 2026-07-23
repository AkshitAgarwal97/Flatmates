"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const uploadService_1 = require("../services/uploadService");
const auth_1 = require("../middleware/auth");
const express_2 = require("../types/express");
const userController_1 = require("../controllers/userController");
const router = express_1.default.Router();
// @route   GET api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', auth_1.protect, (0, express_2.wrapHandler)(userController_1.getCurrentUser));
// @route   PUT api/users/me
// @desc    Update current user profile
// @access  Private
router.put('/me', [
    auth_1.protect,
    uploadService_1.avatarUpload.single('avatar'),
    (0, express_validator_1.check)('name', 'Name is required').optional().not().isEmpty(),
    (0, express_validator_1.check)('email', 'Please include a valid email').optional().isEmail(),
    (0, express_validator_1.check)('phone', 'Please include a valid phone number').optional().isMobilePhone('any')
], (0, express_2.wrapHandler)(userController_1.updateCurrentUser));
// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', userController_1.getUserById);
// @route   GET api/users
// @desc    Get all users with filters
// @access  Public
router.get('/', userController_1.getUsers);
// @route   GET api/users/me/notifications
// @desc    Get user notifications
// @access  Private
router.get('/me/notifications', auth_1.protect, (0, express_2.wrapHandler)(userController_1.getNotifications));
// @route   PUT api/users/notifications/:id
// @desc    Mark notification as read
// @access  Private
router.put('/notifications/:id', auth_1.protect, (0, express_2.wrapHandler)(userController_1.markNotificationRead));
// @route   POST api/users/verify/:type
// @desc    Verify user attribute (placeholder)
// @access  Private
router.post('/verify/:type', auth_1.protect, (0, express_2.wrapHandler)(userController_1.verifyUserAttribute));
// @route   POST api/users/block/:userId
// @desc    Block/Unblock a user
// @access  Private
router.post('/block/:userId', auth_1.protect, (0, express_2.wrapHandler)(userController_1.blockUser));
// @route   POST api/users/report
// @desc    Report a user or listing
// @access  Private
router.post('/report', [
    auth_1.protect,
    (0, express_validator_1.check)('reason', 'Reason is required').not().isEmpty(),
    (0, express_validator_1.check)('reason', 'Invalid reason').isIn(['spam', 'harassment', 'fraud', 'inappropriate_content', 'other'])
], (0, express_2.wrapHandler)(userController_1.reportUser));
exports.default = router;
//# sourceMappingURL=users.js.map