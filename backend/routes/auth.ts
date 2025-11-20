import express, { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import { check, validationResult, ValidationError } from 'express-validator';
import User from '../models/User';

const router = express.Router();

// Extend Express Request to include user property
interface AuthenticatedRequest extends Request {
  user?: any;
}

// JWT payload interface
interface JWTPayload {
  id: string;
  userType: string;
}

// Register request body interface
interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  userType: string;
}

// Login request body interface
interface LoginRequest {
  email: string;
  password: string;
}

// Complete profile request body interface
interface CompleteProfileRequest {
  userType: string;
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
    check('userType', 'User type is required').isIn([
      'room_seeker',
      'roommate_seeker',
      'broker_dealer',
      'property_owner'
    ])
  ],
  async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, userType } = req.body;

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
        userType,
        socialProvider: 'local'
      });

      // Encrypt password
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      // Return jsonwebtoken
      const payload: JWTPayload = {
        id: user.id,
        userType: user.userType
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
    check('password', 'Password is required').exists()
  ],
  async (req: Request<{}, {}, LoginRequest>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      // Check if user exists
      let user = await User.findOne({ email, socialProvider: 'local' });

      if (!user) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, user.password || '');

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
      }

      // Return jsonwebtoken
      const payload: JWTPayload = {
        id: user.id,
        userType: user.userType
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
    check('userType', 'User type is required').isIn([
      'room_seeker',
      'roommate_seeker',
      'broker_dealer',
      'property_owner'
    ])
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { userType, phone, bio, preferences } = req.body;

      // Update user profile
      const user = await User.findById(req.user?.id);

      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      user.userType = userType;
      if (phone) user.phone = phone;
      if (bio) user.bio = bio;
      if (preferences) user.preferences = preferences;

      await user.save();

      res.json(user);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

export default router;