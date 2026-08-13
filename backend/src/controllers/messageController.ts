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
    const userId = (req.user as AuthenticatedUser)?._id;
    const userIdStr = userId.toString();

    const rawConversations = await Conversation.find({
      participants: userId,
      isActive: true
    })
      .populate('participants', 'name avatar occupation gender')
      .populate('property', 'title images price address')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    const seenParticipantPairs = new Set<string>();
    const validConversations: any[] = [];

    for (const conv of rawConversations) {
      // Find other participant ID
      const otherPart = conv.participants?.find((p: any) => (p._id || p).toString() !== userIdStr);
      const otherPartId = otherPart ? (otherPart._id || otherPart).toString() : null;

      // If lastMessage is missing, attempt to find latest message in DB
      if (!conv.lastMessage) {
        const latestMsg = await Message.findOne({ conversation: conv._id }).sort({ createdAt: -1 });
        if (latestMsg) {
          conv.lastMessage = latestMsg._id as any;
          await conv.save();
          await conv.populate('lastMessage');
        }
      }

      if (otherPartId) {
        // If we have already seen a conversation for this partner
        if (seenParticipantPairs.has(otherPartId)) {
          // If current conversation has no messages, mark inactive (clean up duplicate)
          if (!conv.lastMessage) {
            conv.isActive = false;
            await conv.save();
            continue;
          }
        } else {
          seenParticipantPairs.add(otherPartId);
        }
      }

      validConversations.push(conv);
    }

    // Transform unreadCount to number for the requesting user
    const conversationsWithUnread = validConversations.map((conv: any) => {
      const convObj = conv.toObject();
      const unreadMap = conv.unreadCount;
      const unread = unreadMap?.get ? (unreadMap.get(userIdStr) || 0) : (unreadMap?.[userIdStr] || 0);
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
    const currentUserId = (req.user as AuthenticatedUser).id.toString();

    // Check if recipient is blocked or blocking the sender
    const sender = await User.findById(currentUserId);
    const recipientUser = await User.findById(recipient);

    if (!sender) return errorRes(res, 'Sender not found', 404);
    if (!recipientUser) return errorRes(res, 'Recipient not found', 404);

    const isBlocked = (sender.blockedUsers as any[])?.includes(recipient) ||
      (recipientUser.blockedUsers as any[])?.includes(sender._id);

    if (isBlocked) {
      return errorRes(res, 'Communication blocked', 403);
    }

    if (recipient === currentUserId) {
      return errorRes(res, 'You cannot message yourself', 400);
    }

    const participantIds = [
      (req.user as AuthenticatedUser)?._id,
      new mongoose.Types.ObjectId(recipient)
    ];

    // Find ANY existing active conversation between these two participants
    let conversation = await Conversation.findOne({
      participants: { $all: participantIds, $size: 2 },
      isActive: true
    }).sort({ updatedAt: -1 });

    if (conversation) {
      // If property specified and conversation didn't have one, update property
      if (property && !conversation.property) {
        conversation.property = new mongoose.Types.ObjectId(property);
        await conversation.save();
      }
    } else {
      // Create a new conversation only if no existing conversation exists
      conversation = new Conversation({
        participants: participantIds,
        ...(property ? { property: new mongoose.Types.ObjectId(property) } : {}),
        unreadCount: {},
        isActive: true,
        contactSharedBy: []
      });
      await conversation.save();
    }

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
      conversation.lastMessage = message._id as any;
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
      .populate('property', 'title images price address')
      .populate({
        path: 'lastMessage',
        populate: { path: 'sender', select: 'name avatar' }
      });

    if (!populatedConversation) return errorRes(res, 'Server error', 500);

    const populatedConvObj = populatedConversation.toObject();
    // Safely get unread count — unreadCount may be a Map or plain object
    const unreadMap: any = populatedConversation.unreadCount;
    const finalUnread = unreadMap?.get
      ? (unreadMap.get((req.user as AuthenticatedUser)?._id.toString()) || 0)
      : (unreadMap?.[(req.user as AuthenticatedUser)?._id.toString()] || 0);

    return success(res, { ...populatedConvObj, unreadCount: finalUnread });
  } catch (err: any) {
    console.error('[createConversation] Error:', err);
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
