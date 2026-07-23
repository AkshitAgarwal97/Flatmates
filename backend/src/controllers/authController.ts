import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';
import User from '../models/User';
import OTP from '../models/OTP';
import emailService from '../services/emailService';
import { AuthenticatedRequest, JWTPayload } from '../types/express';
import { success, error as errorRes, validationError } from '../utils/apiResponse';
import { decryptData } from '../utils/security';

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

export const register = async (req: Request<{}, {}, RegisterRequest>, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationError(res, errors.array());
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
        emailService.sendWelcomeEmail(user!.email, user!.name).catch((err: any) =>
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
        // Not using success() helper here to maintain exactly the same frontend payload for auth
        res.json({
          token,
          user: {
            _id: user!.id,
            name: user!.name,
            email: user!.email,
            needsProfileCompletion: user!.needsProfileCompletion
          }
        });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, 'Server error');
  }
};

export const login = async (req: Request<{}, {}, LoginRequest>, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationError(res, errors.array());
  }

  const { email, password: encryptedPassword } = req.body;
  const password = decryptData(encryptedPassword);

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
        res.json({
          token,
          user: {
            _id: user!.id,
            name: user!.name,
            email: user!.email,
            needsProfileCompletion: user!.needsProfileCompletion
          }
        });
      }
    );
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, 'Server error');
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const user = await User.findById(authReq.user?.id).select('-password');
    // Keeping this res.json for backwards compatibility unless we want to refactor frontend
    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, 'Server error');
  }
};

export const completeProfile = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationError(res, errors.array());
  }

  try {
    const { phone, bio, preferences } = req.body;

    // Update user profile
    const authReq = req as AuthenticatedRequest;
    const user = await User.findById(authReq.user?.id);

    if (!user) {
      return errorRes(res, 'User not found', 404);
    }

    if (phone) user.phone = phone;
    if (bio) user.bio = bio;
    if (preferences) user.preferences = preferences;

    user.needsProfileCompletion = false;

    await user.save();

    res.json(user);
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, 'Server error');
  }
};

export const forgotPassword = async (req: Request<{}, {}, { email: string }>, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationError(res, errors.array());
  }

  const { email } = req.body;

  try {
    const { generateOTP, sendOTPEmail } = await import('../services/emailService');

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ errors: [{ msg: 'User not found' }] });
    }

    const otp = generateOTP();
    await OTP.deleteMany({ email: email.toLowerCase() });

    const otpDoc = new OTP({ email: email.toLowerCase(), otp });
    await otpDoc.save();
    await sendOTPEmail(email, otp);

    return success(res, { message: 'OTP sent to your email' });
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, 'Server error');
  }
};

export const verifyOtp = async (req: Request<{}, {}, { email: string; otp: string }>, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationError(res, errors.array());
  }

  const { email, otp } = req.body;

  try {
    const otpDoc = await OTP.findOne({ email: email.toLowerCase(), otp });

    if (!otpDoc) {
      return res.status(400).json({ errors: [{ msg: 'Invalid or expired OTP' }] });
    }

    return success(res, { message: 'OTP verified successfully' });
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, 'Server error');
  }
};

export const resetPassword = async (req: Request<{}, {}, { email: string; otp: string; password: string }>, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationError(res, errors.array());
  }

  const { email, otp, password: encryptedPassword } = req.body;
  const password = decryptData(encryptedPassword);

  try {
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

    return success(res, { message: 'Password reset successfully' });
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, 'Server error');
  }
};
