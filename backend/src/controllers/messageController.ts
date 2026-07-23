import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { validationResult } from 'express-validator';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import User from '../models/User';
import emailService from '../services/emailService';
import { success, error as errorRes, validationError } from '../utils/apiResponse';

// User type for authenticated requests
interface AuthenticatedUser {
  _id: mongoose.Types.ObjectId;
  id: string;
  name: string;
  [key: string]: any;
}

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

export const getConversations = async (req: Request, res: Response) => {
  try {
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

    return success(res, conversationsWithUnread);
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, 'Server error');
  }
};

export const createConversation = async (req: Request<{}, {}, CreateConversationRequest>, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationError(res, errors.array());
  }

  try {
    const { recipient, property, initialMessage } = req.body;

    // Check if recipient is blocked or blocking the sender
    const sender = await User.findById((req.user as AuthenticatedUser).id);
    const recipientUser = await User.findById(recipient);

    if (!sender) return errorRes(res, 'Sender not found', 404);
    if (!recipientUser) return errorRes(res, 'Recipient not found', 404);

    const isBlocked = (sender.blockedUsers as any[])?.includes(recipient) ||
      (recipientUser.blockedUsers as any[])?.includes(sender._id);

    if (isBlocked) {
      return errorRes(res, 'Communication blocked', 403);
    }

    if (recipient === (req.user as AuthenticatedUser).id.toString()) {
      return errorRes(res, 'You cannot message yourself', 400);
    }

    // ★ FIX #5: Atomic findOrCreate conversation to prevent concurrent duplicate threads.
    // Use findOneAndUpdate with upsert option, handling property null condition correctly.
    const propertyFilter = property ? { property: new mongoose.Types.ObjectId(property) } : { property: { $exists: false } };
    
    let conversation = await Conversation.findOneAndUpdate(
      {
        participants: { $all: [(req.user as AuthenticatedUser)?._id, new mongoose.Types.ObjectId(recipient)] },
        ...propertyFilter
      },
      {
        $setOnInsert: {
          participants: [(req.user as AuthenticatedUser)?._id, new mongoose.Types.ObjectId(recipient)],
          property: property ? new mongoose.Types.ObjectId(property) : null,
          unreadCount: new Map(),
          isActive: true,
          contactSharedBy: []
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    const convObj = conversation.toObject();
    const unread = conversation.unreadCount.get((req.user as AuthenticatedUser)?._id.toString()) || 0;

    // Reactivate archived/inactive conversation
    if (!conversation.isActive) {
      conversation.isActive = true;
      await conversation.save();
    }

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
            $each: [{
              type: 'message',
              content: `New message from ${(req.user as AuthenticatedUser)?.name}`,
              relatedTo: conversation._id,
              read: false,
              createdAt: new Date()
            }],
            $slice: -100
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

    if (!populatedConversation) return errorRes(res, 'Server error', 500);

    const populatedConvObj = populatedConversation.toObject();
    const finalUnread = 0;

    return success(res, { ...populatedConvObj, unreadCount: finalUnread });
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, 'Server error');
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return errorRes(res, 'Conversation not found', 404);
    }

    // Check if user is part of the conversation
    const authUserId = (req.user as AuthenticatedUser)?._id.toString();
    if (!conversation.participants.some((p: any) => (p._id || p).toString() === authUserId)) {
      return errorRes(res, 'Not authorized', 401);
    }

    // Get messages
    const messages = await Message.find({ conversation: req.params.id })
      .sort({ createdAt: 1 })
      .populate('sender', 'name avatar');

    // ★ FIX #6: Use new Date() instead of Date.now() to match schema type Date and prevent type corruption
    await Message.updateMany(
      { conversation: req.params.id, sender: { $ne: (req.user as AuthenticatedUser)?._id }, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    // Reset unread count for this user
    conversation.unreadCount.set((req.user as AuthenticatedUser)?._id.toString(), 0);
    await conversation.save();

    return success(res, messages);
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return errorRes(res, 'Conversation not found', 404);
    }
    return errorRes(res, 'Server error');
  }
};

export const sendMessage = async (req: Request<{ id: string }, {}, SendMessageRequest>, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return validationError(res, errors.array());
  }

  try {
    console.log(`[POST /conversations/:id] Sending message for convo: ${req.params.id}`);

    const senderId = (req.user as AuthenticatedUser)?._id;

    // Handle file uploads if any
    let attachments: any[] = [];
    if (req.files && Array.isArray(req.files)) {
      const files = req.files as Express.Multer.File[];
      attachments = files.map(file => ({
        attachmentType: file.mimetype.startsWith('image/') ? 'image' : 'document',
        url: `/uploads/messages/${file.filename}`,
        fileType: file.mimetype
      }));
    }

    const { sendMessageToConversation } = await import('../services/messageService');
    const populatedMessage = await sendMessageToConversation({
      conversationId: req.params.id,
      senderId: senderId,
      content: req.body.content,
      attachments
    });

    // ★ FIX #2: Emit the message via Socket.IO directly from the HTTP layer after saving
    const { getIo } = await import('../services/notificationService');
    const io = getIo();
    if (io) {
      io.to(`conversation:${req.params.id}`).emit('new-message', populatedMessage);
      
      // Send real-time notification to participants who are not currently joined in the conversation room
      const conversation = await Conversation.findById(req.params.id);
      if (conversation) {
        conversation.participants.forEach((participant: mongoose.Types.ObjectId) => {
          if (participant.toString() !== senderId.toString()) {
            io.to(participant.toString()).emit('message-notification', {
              conversationId: req.params.id,
              message: populatedMessage
            });
          }
        });
      }
    }

    return success(res, populatedMessage);
  } catch (err: any) {
    console.error('[POST /conversations/:id] ERROR:', err);
    return errorRes(res, err.message || 'Server error');
  }
};

export const archiveConversation = async (req: Request, res: Response) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return errorRes(res, 'Conversation not found', 404);
    }

    // Check if user is part of the conversation
    const authUserId = (req.user as AuthenticatedUser)?._id.toString();
    if (!conversation.participants.some((p: any) => (p._id || p).toString() === authUserId)) {
      return errorRes(res, 'Not authorized', 401);
    }

    // Soft delete by marking as inactive
    conversation.isActive = false;
    await conversation.save();

    return success(res, { msg: 'Conversation archived' });
  } catch (err: any) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return errorRes(res, 'Conversation not found', 404);
    }
    return errorRes(res, 'Server error');
  }
};

export const shareContact = async (req: Request, res: Response) => {
  try {
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) {
      return errorRes(res, 'Conversation not found', 404);
    }

    const authUser = req.user as AuthenticatedUser;
    if (!conversation.participants.some(p => p.toString() === authUser.id.toString())) {
      return errorRes(res, 'Not authorized', 401);
    }

    // Add user to contactSharedBy if not already there
    if (!conversation.contactSharedBy.includes(authUser._id)) {
      conversation.contactSharedBy.push(authUser._id);

      // Add a system message to the conversation
      const systemMessage = new Message({
        conversation: conversation._id,
        sender: authUser._id,
        content: `${authUser.name} has shared their contact details.`,
        type: 'system' // Assuming Message model supports type
      });
      await systemMessage.save();

      conversation.lastMessage = systemMessage._id;
      await conversation.save();

      // Check if both have shared
      if (conversation.contactSharedBy.length === conversation.participants.length) {
        // Send notification about mutual interest
        // (Implementation for notification omitted for brevity, but would go here)
      }
    }

    return success(res, conversation);
  } catch (err: any) {
    console.error(err.message);
    return errorRes(res, 'Server error');
  }
};
