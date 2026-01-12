import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { check, validationResult, ValidationError } from 'express-validator';
import User from '../models/User';
import emailService from '../services/emailService';
import { decryptData } from '../utils/security';

const router = express.Router();

// Extend Express Request to include user property
interface AuthenticatedRequest extends Request {
  user?: any;
}

// JWT payload interface
interface JWTPayload {
  id: string;
}

// Register request body interface
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

// Login request body interface
interface LoginRequest {
  email: string;
  password: string;
}

// Complete profile request body interface
interface CompleteProfileRequest {
  phone?: string;
  bio?: string;
  preferences?: any;
}

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
  async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password: encryptedPassword } = req.body;
    const password = decryptData(encryptedPassword);

    try {
      // Check if user exists
      let user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ errors: [{ msg: 'User already exists' }] });
      }

      user = new User({
        name,
        email,
        password,
        socialProvider: 'local'
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Send welcome email asynchronously (fire-and-forget)
      try {
        setImmediate(() => {
          emailService.sendWelcomeEmail(user.email, user.name).catch((err: any) =>
            console.error('Failed to send welcome email:', err)
          );
        });
      } catch (e) {
        console.error('Failed to schedule welcome email send:', e);
      }

      // Return jsonwebtoken
      const payload: JWTPayload = {
        id: user.id
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '7d' },
        (err: Error | null, token: string | undefined) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
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
  async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password: encryptedPassword } = req.body;
    let password = decryptData(encryptedPassword);

    // Strict validation: Ensure password is not empty after decryption
    if (!password || password.trim() === '') {
      return res.status(400).json({ errors: [{ msg: 'Password is required', type: 'INVALID_PASSWORD' }] });
    }

    try {
      // Check if user exists
      let user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'User not found', type: 'USER_NOT_FOUND' }] });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password || '');

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid password', type: 'INVALID_PASSWORD' }] });
      }

      // Return jsonwebtoken
      const payload: JWTPayload = {
        id: user.id
      };

      jwt.sign(
        payload,
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: '7d' },
        (err: Error | null, token: string | undefined) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/auth/user
// @desc    Get user data
// @access  Private
router.get('/user', passport.authenticate('jwt', { session: false }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findById(req.user?.id).select('-password');
    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/auth/complete-profile
// @desc    Complete user profile after social login
// @access  Private
router.put(
  '/complete-profile',
  [
    passport.authenticate('jwt', { session: false }),
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { phone, bio, preferences } = req.body;

      // Update user profile
      const user = await User.findById(req.user?.id);

      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      if (phone) user.phone = phone;
      if (bio) user.bio = bio;
      if (preferences) user.preferences = preferences;

      user.needsProfileCompletion = false;

      await user.save();

      res.json(user);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/auth/forgot-password
// @desc    Send OTP to email for password reset
// @access  Public
router.post(
  '/forgot-password',
  [check('email', 'Please include a valid email').isEmail()],
  async (req: Request<{}, {}, { email: string }>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    try {
      const User = (await import('../models/User')).default;
      const OTP = (await import('../models/OTP')).default;
      const { generateOTP, sendOTPEmail } = await import('../utils/emailService');

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
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
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
  async (req: Request<{}, {}, { email: string; otp: string }>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp } = req.body;

    try {
      const OTP = (await import('../models/OTP')).default;
      const otpDoc = await OTP.findOne({ email: email.toLowerCase(), otp });

      if (!otpDoc) {
        return res.status(400).json({ errors: [{ msg: 'Invalid or expired OTP' }] });
      }

      res.json({ msg: 'OTP verified successfully' });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
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
  async (req: Request<{}, {}, { email: string; otp: string; password: string }>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, otp, password } = req.body;

    try {
      const User = (await import('../models/User')).default;
      const OTP = (await import('../models/OTP')).default;

      const otpDoc = await OTP.findOne({ email: email.toLowerCase(), otp });
      if (!otpDoc) {
        return res.status(400).json({ errors: [{ msg: 'Invalid or expired OTP' }] });
      }

      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return res.status(404).json({ errors: [{ msg: 'User not found' }] });
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      await user.save();
      await OTP.deleteOne({ _id: otpDoc._id });

      res.json({ msg: 'Password reset successfully' });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

export default router;