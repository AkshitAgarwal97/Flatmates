import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import User from '../models/User';
import Conversation from '../models/Conversation';
import Report from '../models/Report';
import { AuthenticatedRequest } from '../types/express';
import { success, error as errorRes, validationError } from '../utils/apiResponse';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/uploadService';

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = await User.findById(authReq.user?.id).select('-password');
    return success(res, user);
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, 'Server error');
  }
};

export const updateCurrentUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationError(res, errors.array());
  }

  try {
    const { name, email, phone, bio, preferences } = req.body;

    // Build profile object
    const profileFields: any = {};
    if (name) profileFields.name = name;
    if (email) profileFields.email = email;
    if (phone) profileFields.phone = phone;
    if (bio) profileFields.bio = bio;
    if (preferences) profileFields.preferences = preferences;

    const authReq = req as AuthenticatedRequest;
    let user = await User.findById(authReq.user?.id);
    if (!user) return errorRes(res, 'User not found', 404);

    // Handle avatar upload
    if (req.file) {
      if (user.avatar?.includes('cloudinary.com')) {
        const publicId = user.avatar.split('/').slice(-2).join('/').split('.')[0];
        deleteFromCloudinary(publicId).catch(console.error);
      }
      const result = await uploadToCloudinary(req.file.buffer, 'flatmates/avatars');
      profileFields.avatar = result.url;
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      authReq.user?.id,
      { $set: profileFields },
      { new: true }
    ).select('-password');

    return success(res, updatedUser);
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, 'Server error');
  }
};

export const getUserById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select('-password -notifications');

    if (!user) {
      return errorRes(res, 'User not found', 404);
    }

    const userObj = user.toObject();

    // Privacy: Hide phone number unless mutual interest (contact shared by both)
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

    return success(res, userObj);
  } catch (err: any) {
    console.error(`[GET api/users/:id] Error fetching user ${req.params.id}:`, err.message);
    if (err.name === 'CastError' || err.kind === 'ObjectId') {
      return errorRes(res, 'User not found', 404);
    }
    return errorRes(res, 'Server error');
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const { city, search, page = 1, limit = 10 } = req.query;

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

    // Keep this shape as some frontends expect it exactly, but wrap in success if applicable.
    // However, existing endpoints sometimes returned raw json. Using success() adds `{ success: true, data: ... }` wrapper
    // which might break frontend. I will use res.json for complex pagination objects to avoid breaking frontend unless frontend is adapted.
    // Let's use res.json for `getUsers` to ensure backwards compatibility with Redux store if it's strictly checking this shape.
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
    return errorRes(res, 'Server error');
  }
};

export const getNotifications = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = await User.findById(authReq.user?.id).select('notifications');
    // Keeping res.json for exact backward compatibility on arrays
    res.json(user?.notifications || []);
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, 'Server error');
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = await User.findById(authReq.user?.id);

    if (!user) {
      return errorRes(res, 'User not found', 404);
    }

    const notification = user.notifications.find((n: any) => n._id?.toString() === req.params.id);
    if (!notification) {
      return errorRes(res, 'Notification not found', 404);
    }

    notification.read = true;
    await user.save();

    res.json({ msg: 'Notification marked as read' });
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return errorRes(res, 'Notification not found', 404);
    }
    return errorRes(res, 'Server error');
  }
};

export const verifyUserAttribute = async (req: Request, res: Response) => {
  try {
    const { type } = req.params;
    const allowedTypes = ['email', 'phone', 'id'];

    if (!allowedTypes.includes(type)) {
      return errorRes(res, 'Invalid verification type', 400);
    }

    const authReq = req as AuthenticatedRequest;
    const user = await User.findById(authReq.user?.id);

    if (!user) {
      return errorRes(res, 'User not found', 404);
    }

    if (type === 'email') user.isEmailVerified = true;
    if (type === 'phone') user.isPhoneVerified = true;
    if (type === 'id') user.isIdVerified = true;

    await user.save();
    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, 'Server error');
  }
};

export const blockUser = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = await User.findById(authReq.user?.id);
    const targetId = req.params.userId;

    if (!user) return errorRes(res, 'User not found', 404);
    if (user._id.toString() === targetId) return errorRes(res, 'Cannot block yourself', 400);

    // ★ FIX #10: Always check block list using string comparisons as mongoose.Types.ObjectId !== string
    const isBlocked = user.blockedUsers.some(id => id.toString() === targetId);
    if (isBlocked) {
      user.blockedUsers = user.blockedUsers.filter((id: any) => id.toString() !== targetId);
    } else {
      user.blockedUsers.push(targetId as any);
    }

    await user.save();
    res.json({ blockedUsers: user.blockedUsers });
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, 'Server error');
  }
};

export const reportUser = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return validationError(res, errors.array());

  try {
    const { targetUser, targetProperty, reason, description } = req.body;

    const authReq = req as AuthenticatedRequest;
    const report = new Report({
      reporter: authReq.user?.id as any,
      targetUser,
      targetProperty,
      reason,
      description
    });

    await report.save();
    res.json({ msg: 'Report submitted successfully' });
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, 'Server error');
  }
};
