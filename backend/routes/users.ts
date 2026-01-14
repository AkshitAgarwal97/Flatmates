import express, { Request, Response } from 'express';
import passport from 'passport';
import { check, validationResult } from 'express-validator';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// Extend Express Request to include user property
interface AuthenticatedRequest extends Request {
  user?: any;
}

// Set up multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/avatars/'));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5000000 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Images only!'));
    }
  }
});

// @route   GET api/users/me
// @desc    Get current user profile
// @access  Private
router.get('/me', passport.authenticate('jwt', { session: false }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Import User model dynamically to avoid circular dependencies
    const User = require('../models/User').default;

    const user = await User.findById(req.user?.id).select('-password');
    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/me
// @desc    Update current user profile
// @access  Private
router.put(
  '/me',
  [
    passport.authenticate('jwt', { session: false }),
    upload.single('avatar'),
    check('name', 'Name is required').optional().not().isEmpty(),
    check('email', 'Please include a valid email').optional().isEmail(),
    check('phone', 'Please include a valid phone number').optional().isMobilePhone('any')
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Import User model dynamically to avoid circular dependencies
      const User = require('../models/User').default;

      const { name, email, phone, bio, preferences } = req.body;

      // Build profile object
      const profileFields: any = {};
      if (name) profileFields.name = name;
      if (email) profileFields.email = email;
      if (phone) profileFields.phone = phone;
      if (bio) profileFields.bio = bio;
      if (preferences) profileFields.preferences = preferences;

      // Handle avatar upload
      if (req.file) {
        profileFields.avatar = `/uploads/avatars/${req.file.filename}`;
      }

      // Update user
      const user = await User.findByIdAndUpdate(
        req.user?.id,
        { $set: profileFields },
        { new: true }
      ).select('-password');

      res.json(user);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/users/:id
// @desc    Get user by ID
// @access  Public
router.get('/:id', async (req: Request<{ id: string }>, res: Response) => {
  try {
    // Import User model dynamically to avoid circular dependencies
    const User = require('../models/User').default;

    let user = await User.findById(req.params.id).select('-password -notifications');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const userObj = user.toObject();

    // Privacy: Hide phone number unless mutual interest (contact shared by both)
    // We check if there's ANY conversation between the two where contact is shared by both
    const Conversation = require('../models/Conversation').default;
    const authUser = (req as any).user;

    if (authUser && authUser.id !== userObj._id.toString()) {
      const conversation = await Conversation.findOne({
        participants: { $all: [authUser.id, userObj._id] },
        contactSharedBy: { $all: [authUser.id, userObj._id] }
      });

      if (!conversation) {
        delete userObj.phone;
      }
    } else if (!authUser) {
      delete userObj.phone;
    }

    res.json(userObj);
  } catch (err: any) {
    console.error(`[GET api/users/:id] Error fetching user ${req.params.id}:`, err.message);
    if (err.name === 'CastError' || err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   GET api/users
// @desc    Get all users with filters
// @access  Public
router.get('/', async (req: Request, res: Response) => {
  try {
    const { city, search, page = 1, limit = 10 } = req.query;

    // Import User model dynamically to avoid circular dependencies
    const User = require('../models/User').default;

    // Build filter object
    const filter: any = {};

    if (city) filter['preferences.location'] = new RegExp(city as string, 'i');
    if (search) {
      filter.$or = [
        { name: new RegExp(search as string, 'i') },
        { bio: new RegExp(search as string, 'i') }
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
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   GET api/users/me/notifications
// @desc    Get user notifications
// @access  Private
router.get('/me/notifications', passport.authenticate('jwt', { session: false }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Import User model dynamically to avoid circular dependencies
    const User = require('../models/User').default;

    const user = await User.findById(req.user?.id).select('notifications');
    res.json(user?.notifications || []);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/users/notifications/:id
// @desc    Mark notification as read
// @access  Private
router.put('/notifications/:id', passport.authenticate('jwt', { session: false }), async (req: AuthenticatedRequest, res: Response) => {
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
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Notification not found' });
    }
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/verify/:type
// @desc    Verify user attribute (placeholder)
// @access  Private
router.post('/verify/:type', passport.authenticate('jwt', { session: false }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { type } = req.params;
    const allowedTypes = ['email', 'phone', 'id'];

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({ msg: 'Invalid verification type' });
    }

    const User = require('../models/User').default;
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // In a real app, you would verify an OTP or token here
    if (type === 'email') user.isEmailVerified = true;
    if (type === 'phone') user.isPhoneVerified = true;
    if (type === 'id') user.isIdVerified = true;

    await user.save();
    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/save/:propertyId
// @desc    Toggle save property
// @access  Private
router.post('/save/:propertyId', passport.authenticate('jwt', { session: false }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const User = require('../models/User').default;
    const user = await User.findById(req.user?.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const propertyId = req.params.propertyId as any; // Cast to any to avoid TS error if strict
    const isSaved = user.savedProperties.includes(propertyId);

    if (isSaved) {
      user.savedProperties = user.savedProperties.filter((id: any) => id.toString() !== propertyId);
    } else {
      user.savedProperties.unshift(propertyId);
    }

    await user.save();
    res.json(user.savedProperties);
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/block/:userId
// @desc    Block/Unblock a user
// @access  Private
router.post('/block/:userId', passport.authenticate('jwt', { session: false }), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const User = require('../models/User').default;
    const user = await User.findById(req.user?.id);
    const targetId = req.params.userId;

    if (!user) return res.status(404).json({ msg: 'User not found' });
    if (user._id.toString() === targetId) return res.status(400).json({ msg: 'Cannot block yourself' });

    const isBlocked = user.blockedUsers.includes(targetId);
    if (isBlocked) {
      user.blockedUsers = user.blockedUsers.filter((id: any) => id.toString() !== targetId);
    } else {
      user.blockedUsers.push(targetId);
    }

    await user.save();
    res.json({ blockedUsers: user.blockedUsers });
  } catch (err: any) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/users/report
// @desc    Report a user or listing
// @access  Private
router.post(
  '/report',
  [
    passport.authenticate('jwt', { session: false }),
    check('reason', 'Reason is required').not().isEmpty(),
    check('reason', 'Invalid reason').isIn(['spam', 'harassment', 'fraud', 'inappropriate_content', 'other'])
  ],
  async (req: AuthenticatedRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const Report = require('../models/Report').default;
      const { targetUser, targetProperty, reason, description } = req.body;

      const report = new Report({
        reporter: req.user.id,
        targetUser,
        targetProperty,
        reason,
        description
      });

      await report.save();
      res.json({ msg: 'Report submitted successfully' });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

export default router;
