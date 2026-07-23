import express from 'express';
import { check } from 'express-validator';
import { avatarUpload } from '../services/uploadService';
import { protect } from '../middleware/auth';
import { wrapHandler } from '../types/express';
import {
  getCurrentUser,
  updateCurrentUser,
  getUserById,
  getUsers,
  getNotifications,
  markNotificationRead,
  verifyUserAttribute,
  blockUser,
  reportUser
} from '../controllers/userController';

const router = express.Router();

// @route   GET api/users/me
// @desc    Get current user profile
// @access  Private
router.get(
  '/me',
  protect,
  wrapHandler(getCurrentUser)
);

// @route   PUT api/users/me
// @desc    Update current user profile
// @access  Private
router.put(
  '/me',
  [
    protect,
    avatarUpload.single('avatar'),
    check('name', 'Name is required').optional().not().isEmpty(),
    check('email', 'Please include a valid email').optional().isEmail(),
    check('phone', 'Please include a valid phone number').optional().isMobilePhone('any')
  ],
  wrapHandler(updateCurrentUser)
);

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', getUserById);

// @route   GET api/users
// @desc    Get all users with filters
// @access  Public
router.get('/', getUsers);

// @route   GET api/users/me/notifications
// @desc    Get user notifications
// @access  Private
router.get(
  '/me/notifications',
  protect,
  wrapHandler(getNotifications)
);

// @route   PUT api/users/notifications/:id
// @desc    Mark notification as read
// @access  Private
router.put(
  '/notifications/:id',
  protect,
  wrapHandler(markNotificationRead)
);

// @route   POST api/users/verify/:type
// @desc    Verify user attribute (placeholder)
// @access  Private
router.post(
  '/verify/:type',
  protect,
  wrapHandler(verifyUserAttribute)
);

// @route   POST api/users/block/:userId
// @desc    Block/Unblock a user
// @access  Private
router.post(
  '/block/:userId',
  protect,
  wrapHandler(blockUser)
);

// @route   POST api/users/report
// @desc    Report a user or listing
// @access  Private
router.post(
  '/report',
  [
    protect,
    check('reason', 'Reason is required').not().isEmpty(),
    check('reason', 'Invalid reason').isIn(['spam', 'harassment', 'fraud', 'inappropriate_content', 'other'])
  ],
  wrapHandler(reportUser)
);

export default router;
