import express from 'express';
import { check } from 'express-validator';
import { protect } from '../middleware/auth';
import { wrapHandler } from '../types/express';
import {
  register,
  login,
  getUser,
  completeProfile,
  forgotPassword,
  verifyOtp,
  resetPassword
} from '../controllers/authController';

const router = express.Router();

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post(
  '/register',
  [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 }),
  ],
  register
);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists().not().isEmpty()
  ],
  login
);

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get(
  '/user',
  protect,
  wrapHandler(getUser)
);

// @route   PUT api/auth/complete-profile
// @desc    Complete user profile after social login
// @access  Private
router.put(
  '/complete-profile',
  protect,
  wrapHandler(completeProfile)
);

// @route   POST api/auth/forgot-password
// @desc    Send OTP to email for password reset
// @access  Public
router.post(
  '/forgot-password',
  [check('email', 'Please include a valid email').isEmail()],
  forgotPassword
);

// @route   POST api/auth/verify-otp
// @desc    Verify OTP code
// @access  Public
router.post(
  '/verify-otp',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('otp', 'OTP is required').not().isEmpty()
  ],
  verifyOtp
);

// @route   POST api/auth/reset-password
// @desc    Reset password with OTP
// @access  Public
router.post(
  '/reset-password',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('otp', 'OTP is required').not().isEmpty(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  resetPassword
);

export default router;
