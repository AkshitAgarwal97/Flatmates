import express, { Request, Response } from 'express';
import passport from 'passport';
import { check, validationResult } from 'express-validator';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';

const router = express.Router();

// User type for authenticated requests
interface AuthenticatedUser {
  _id: mongoose.Types.ObjectId;
  id: string;
  name: string;
  [key: string]: any;
}

// Message request body interfaces
interface CreateConversationRequest {
  recipient: string;
  property?: string;
  initialMessage?: string;
}

interface SendMessageRequest {
  content: string;
  attachments?: Array<{
    type: string;
    url: string;
    fileType?: string;
  }>;
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/messages/');
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Error: Images and documents only!'));
    }
  }
});

// @route   GET api/messages/conversations
// @desc    Get all conversations for a user
// @access  Private
router.get(
  '/conversations',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
    try {
      // Import models dynamically to avoid circular dependencies
      const Conversation = require('../models/Conversation').default;

      const conversations = await Conversation.find({
        participants: (req.user as AuthenticatedUser)?._id,
        isActive: true
      })
        .populate('participants', 'name avatar')
        .populate('property', 'title images')
        .populate('lastMessage')
        .sort({ updatedAt: -1 });

      // Transform unreadCount to number for the requesting user
      const conversationsWithUnread = conversations.map((conv: any) => {
        const convObj = conv.toObject();
        const unread = conv.unreadCount.get((req.user as AuthenticatedUser)?._id.toString()) || 0;
        return { ...convObj, unreadCount: unread };
      });

      res.json(conversationsWithUnread);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/messages/conversations
// @desc    Create a new conversation
// @access  Private
router.post(
  '/conversations',
  [
    passport.authenticate('jwt', { session: false }),
    check('recipient', 'Recipient is required').not().isEmpty(),
    check('property', 'Property ID is required').optional()
  ],
  async (req: Request<{}, {}, CreateConversationRequest>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Import models dynamically to avoid circular dependencies
      const Conversation = require('../models/Conversation').default;
      const Message = require('../models/Message').default;
      const User = require('../models/User').default;

      const { recipient, property, initialMessage } = req.body;

      // Check if recipient exists
      const recipientUser = await User.findById(recipient);
      if (!recipientUser) {
        return res.status(404).json({ msg: 'Recipient not found' });
      }

      // Check if conversation already exists
      let conversation = await Conversation.findOne({
        participants: { $all: [(req.user as AuthenticatedUser)?._id, recipient] },
        property: property || { $exists: false }
      });

      if (conversation) {
        // If conversation exists but is inactive, reactivate it
        if (!conversation.isActive) {
          conversation.isActive = true;
          await conversation.save();
        }

        // Populate and return existing conversation
        const populatedExisting = await Conversation.findById(conversation._id)
          .populate('participants', 'name avatar')
          .populate('property', 'title images')
          .populate({
            path: 'lastMessage',
            populate: { path: 'sender', select: 'name avatar' }
          });

        if (!populatedExisting) return res.status(500).send('Server error');

        const convObj = populatedExisting.toObject();
        const unread = conversation.unreadCount.get((req.user as AuthenticatedUser)?._id.toString()) || 0;

        return res.json({ ...convObj, unreadCount: unread });
      }

      // Create new conversation
      conversation = new Conversation({
        participants: [(req.user as AuthenticatedUser)?._id, recipient],
        property: property || null,
        unreadCount: { [recipient]: initialMessage ? 1 : 0 }
      });

      await conversation.save();

      // If initial message provided, create it
      if (initialMessage) {
        const message = new Message({
          conversation: conversation._id,
          sender: (req.user as AuthenticatedUser)?._id,
          content: initialMessage
        });

        await message.save();

        // Update conversation with last message
        conversation.lastMessage = message._id;
        await conversation.save();

        // Add notification for recipient
        await User.findByIdAndUpdate(recipient, {
          $push: {
            notifications: {
              type: 'message',
              content: `New message from ${(req.user as AuthenticatedUser)?.name}`,
              relatedTo: conversation._id
            }
          }
        });
      }

      // Populate and return conversation
      const populatedConversation = await Conversation.findById(conversation._id)
        .populate('participants', 'name avatar')
        .populate('property', 'title images')
        .populate({
          path: 'lastMessage',
          populate: { path: 'sender', select: 'name avatar' }
        });

      if (!populatedConversation) return res.status(500).send('Server error');

      const convObj = populatedConversation.toObject();
      // For new conversation creator, unread count is 0
      const unread = 0;

      res.json({ ...convObj, unreadCount: unread });
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/messages/conversations/:id
// @desc    Get messages for a conversation
// @access  Private
router.get(
  '/conversations/:id',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
    try {
      // Import models dynamically to avoid circular dependencies
      const Conversation = require('../models/Conversation').default;
      const Message = require('../models/Message').default;

      const conversation = await Conversation.findById(req.params.id);

      if (!conversation) {
        return res.status(404).json({ msg: 'Conversation not found' });
      }

      // Check if user is part of the conversation
      if (!conversation.participants.includes((req.user as AuthenticatedUser)?._id)) {
        return res.status(401).json({ msg: 'Not authorized' });
      }

      // Get messages
      const messages = await Message.find({ conversation: req.params.id })
        .sort({ createdAt: 1 })
        .populate('sender', 'name avatar');

      // Mark messages as read
      await Message.updateMany(
        { conversation: req.params.id, sender: { $ne: (req.user as AuthenticatedUser)?._id }, read: false },
        { $set: { read: true, readAt: Date.now() } }
      );

      // Reset unread count for this user
      conversation.unreadCount.set((req.user as AuthenticatedUser)?._id.toString(), 0);
      await conversation.save();

      res.json(messages);
    } catch (err: any) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Conversation not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

// @route   POST api/messages/conversations/:id
// @desc    Send a message in a conversation
// @access  Private
router.post(
  '/conversations/:id',
  [
    passport.authenticate('jwt', { session: false }),
    upload.array('attachments', 5),
    check('content', 'Message content is required').not().isEmpty()
  ],
  async (req: Request<{ id: string }, {}, SendMessageRequest>, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      // Import models dynamically to avoid circular dependencies
      const Conversation = require('../models/Conversation').default;
      const Message = require('../models/Message').default;
      const User = require('../models/User').default;

      const conversation = await Conversation.findById(req.params.id);

      if (!conversation) {
        return res.status(404).json({ msg: 'Conversation not found' });
      }

      // Check if user is part of the conversation
      if (!conversation.participants.includes((req.user as AuthenticatedUser)?._id)) {
        return res.status(401).json({ msg: 'Not authorized' });
      }

      // Create message
      const newMessage = new Message({
        conversation: req.params.id,
        sender: (req.user as AuthenticatedUser)?._id,
        content: req.body.content,
        attachments: req.body.attachments || []
      });

      // Handle file uploads if any
      if (req.files && Array.isArray(req.files)) {
        const files = req.files as Express.Multer.File[];
        const attachments = files.map(file => ({
          type: file.mimetype.startsWith('image/') ? 'image' : 'document',
          url: `/uploads/messages/${file.filename}`,
          fileType: file.mimetype
        }));
        newMessage.attachments = attachments;
      }

      const message = await newMessage.save();

      // Update conversation
      conversation.lastMessage = message._id;
      conversation.updatedAt = new Date();

      // Increment unread count for other participants
      conversation.participants.forEach((participant: any) => {
        if (participant.toString() !== (req.user as AuthenticatedUser)?._id.toString()) {
          const currentCount = conversation.unreadCount.get(participant.toString()) || 0;
          conversation.unreadCount.set(participant.toString(), currentCount + 1);

          // Add notification for recipient
          User.findByIdAndUpdate(participant, {
            $push: {
              notifications: {
                type: 'message',
                content: `New message from ${(req.user as AuthenticatedUser)?.name}`,
                relatedTo: conversation._id
              }
            }
          }).catch((err: any) => console.error('Error creating notification:', err));
        }
      });

      await conversation.save();

      // Populate and return message
      const populatedMessage = await Message.findById(message._id).populate(
        'sender',
        'name avatar'
      );

      res.json(populatedMessage);
    } catch (err: any) {
      console.error(err.message);
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/messages/conversations/:id
// @desc    Archive a conversation (soft delete)
// @access  Private
router.delete(
  '/conversations/:id',
  passport.authenticate('jwt', { session: false }),
  async (req: Request, res: Response) => {
    try {
      // Import models dynamically to avoid circular dependencies
      const Conversation = require('../models/Conversation').default;

      const conversation = await Conversation.findById(req.params.id);

      if (!conversation) {
        return res.status(404).json({ msg: 'Conversation not found' });
      }

      // Check if user is part of the conversation
      if (!conversation.participants.includes((req.user as AuthenticatedUser)?._id)) {
        return res.status(401).json({ msg: 'Not authorized' });
      }

      // Soft delete by marking as inactive
      conversation.isActive = false;
      await conversation.save();

      res.json({ msg: 'Conversation archived' });
    } catch (err: any) {
      console.error(err.message);
      if (err.kind === 'ObjectId') {
        return res.status(404).json({ msg: 'Conversation not found' });
      }
      res.status(500).send('Server error');
    }
  }
);

export default router;