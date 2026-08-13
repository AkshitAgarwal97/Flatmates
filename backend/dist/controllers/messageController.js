"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareContact = exports.archiveConversation = exports.sendMessage = exports.getMessages = exports.createConversation = exports.getConversations = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const express_validator_1 = require("express-validator");
const Conversation_1 = __importDefault(require("../models/Conversation"));
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
const apiResponse_1 = require("../utils/apiResponse");
const getConversations = async (req, res) => {
    try {
        const userId = req.user?._id;
        const userIdStr = userId.toString();
        const rawConversations = await Conversation_1.default.find({
            participants: userId,
            isActive: true
        })
            .populate('participants', 'name avatar occupation gender')
            .populate('property', 'title images price address')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });
        const seenParticipantPairs = new Set();
        const validConversations = [];
        for (const conv of rawConversations) {
            // Find other participant ID
            const otherPart = conv.participants?.find((p) => (p._id || p).toString() !== userIdStr);
            const otherPartId = otherPart ? (otherPart._id || otherPart).toString() : null;
            // If lastMessage is missing, attempt to find latest message in DB
            if (!conv.lastMessage) {
                const latestMsg = await Message_1.default.findOne({ conversation: conv._id }).sort({ createdAt: -1 });
                if (latestMsg) {
                    conv.lastMessage = latestMsg._id;
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
                }
                else {
                    seenParticipantPairs.add(otherPartId);
                }
            }
            validConversations.push(conv);
        }
        // Transform unreadCount to number for the requesting user
        const conversationsWithUnread = validConversations.map((conv) => {
            const convObj = conv.toObject();
            const unreadMap = conv.unreadCount;
            const unread = unreadMap?.get ? (unreadMap.get(userIdStr) || 0) : (unreadMap?.[userIdStr] || 0);
            return { ...convObj, unreadCount: unread };
        });
        return (0, apiResponse_1.success)(res, conversationsWithUnread);
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.getConversations = getConversations;
const createConversation = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return (0, apiResponse_1.validationError)(res, errors.array());
    }
    try {
        const { recipient, property, initialMessage } = req.body;
        const currentUserId = req.user.id.toString();
        // Check if recipient is blocked or blocking the sender
        const sender = await User_1.default.findById(currentUserId);
        const recipientUser = await User_1.default.findById(recipient);
        if (!sender)
            return (0, apiResponse_1.error)(res, 'Sender not found', 404);
        if (!recipientUser)
            return (0, apiResponse_1.error)(res, 'Recipient not found', 404);
        const isBlocked = sender.blockedUsers?.includes(recipient) ||
            recipientUser.blockedUsers?.includes(sender._id);
        if (isBlocked) {
            return (0, apiResponse_1.error)(res, 'Communication blocked', 403);
        }
        if (recipient === currentUserId) {
            return (0, apiResponse_1.error)(res, 'You cannot message yourself', 400);
        }
        const participantIds = [
            req.user?._id,
            new mongoose_1.default.Types.ObjectId(recipient)
        ];
        // Find ANY existing active conversation between these two participants
        let conversation = await Conversation_1.default.findOne({
            participants: { $all: participantIds, $size: 2 },
            isActive: true
        }).sort({ updatedAt: -1 });
        if (conversation) {
            // If property specified and conversation didn't have one, update property
            if (property && !conversation.property) {
                conversation.property = new mongoose_1.default.Types.ObjectId(property);
                await conversation.save();
            }
        }
        else {
            // Create a new conversation only if no existing conversation exists
            conversation = new Conversation_1.default({
                participants: participantIds,
                ...(property ? { property: new mongoose_1.default.Types.ObjectId(property) } : {}),
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
            const message = new Message_1.default({
                conversation: conversation._id,
                sender: req.user?._id,
                content: initialMessage
            });
            await message.save();
            // Update conversation with last message
            conversation.lastMessage = message._id;
            await conversation.save();
            // Add notification for recipient
            await User_1.default.findByIdAndUpdate(recipient, {
                $push: {
                    notifications: {
                        $each: [{
                                type: 'message',
                                content: `New message from ${req.user?.name}`,
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
        const populatedConversation = await Conversation_1.default.findById(conversation._id)
            .populate('participants', 'name avatar')
            .populate('property', 'title images price address')
            .populate({
            path: 'lastMessage',
            populate: { path: 'sender', select: 'name avatar' }
        });
        if (!populatedConversation)
            return (0, apiResponse_1.error)(res, 'Server error', 500);
        const populatedConvObj = populatedConversation.toObject();
        // Safely get unread count — unreadCount may be a Map or plain object
        const unreadMap = populatedConversation.unreadCount;
        const finalUnread = unreadMap?.get
            ? (unreadMap.get(req.user?._id.toString()) || 0)
            : (unreadMap?.[req.user?._id.toString()] || 0);
        return (0, apiResponse_1.success)(res, { ...populatedConvObj, unreadCount: finalUnread });
    }
    catch (err) {
        console.error('[createConversation] Error:', err);
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.createConversation = createConversation;
const getMessages = async (req, res) => {
    try {
        const conversation = await Conversation_1.default.findById(req.params.id);
        if (!conversation) {
            return (0, apiResponse_1.error)(res, 'Conversation not found', 404);
        }
        // Check if user is part of the conversation
        const authUserId = req.user?._id.toString();
        if (!conversation.participants.some((p) => (p._id || p).toString() === authUserId)) {
            return (0, apiResponse_1.error)(res, 'Not authorized', 401);
        }
        // Get messages
        const messages = await Message_1.default.find({ conversation: req.params.id })
            .sort({ createdAt: 1 })
            .populate('sender', 'name avatar');
        // ★ FIX #6: Use new Date() instead of Date.now() to match schema type Date and prevent type corruption
        await Message_1.default.updateMany({ conversation: req.params.id, sender: { $ne: req.user?._id }, read: false }, { $set: { read: true, readAt: new Date() } });
        // Reset unread count for this user
        conversation.unreadCount.set(req.user?._id.toString(), 0);
        await conversation.save();
        return (0, apiResponse_1.success)(res, messages);
    }
    catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return (0, apiResponse_1.error)(res, 'Conversation not found', 404);
        }
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.getMessages = getMessages;
const sendMessage = async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return (0, apiResponse_1.validationError)(res, errors.array());
    }
    try {
        console.log(`[POST /conversations/:id] Sending message for convo: ${req.params.id}`);
        const senderId = req.user?._id;
        // Handle file uploads if any
        let attachments = [];
        if (req.files && Array.isArray(req.files)) {
            const files = req.files;
            attachments = files.map(file => ({
                attachmentType: file.mimetype.startsWith('image/') ? 'image' : 'document',
                url: `/uploads/messages/${file.filename}`,
                fileType: file.mimetype
            }));
        }
        const { sendMessageToConversation } = await Promise.resolve().then(() => __importStar(require('../services/messageService')));
        const populatedMessage = await sendMessageToConversation({
            conversationId: req.params.id,
            senderId: senderId,
            content: req.body.content,
            attachments
        });
        // ★ FIX #2: Emit the message via Socket.IO directly from the HTTP layer after saving
        const { getIo } = await Promise.resolve().then(() => __importStar(require('../services/notificationService')));
        const io = getIo();
        if (io) {
            io.to(`conversation:${req.params.id}`).emit('new-message', populatedMessage);
            // Send real-time notification to participants who are not currently joined in the conversation room
            const conversation = await Conversation_1.default.findById(req.params.id);
            if (conversation) {
                conversation.participants.forEach((participant) => {
                    if (participant.toString() !== senderId.toString()) {
                        io.to(participant.toString()).emit('message-notification', {
                            conversationId: req.params.id,
                            message: populatedMessage
                        });
                    }
                });
            }
        }
        return (0, apiResponse_1.success)(res, populatedMessage);
    }
    catch (err) {
        console.error('[POST /conversations/:id] ERROR:', err);
        return (0, apiResponse_1.error)(res, err.message || 'Server error');
    }
};
exports.sendMessage = sendMessage;
const archiveConversation = async (req, res) => {
    try {
        const conversation = await Conversation_1.default.findById(req.params.id);
        if (!conversation) {
            return (0, apiResponse_1.error)(res, 'Conversation not found', 404);
        }
        // Check if user is part of the conversation
        const authUserId = req.user?._id.toString();
        if (!conversation.participants.some((p) => (p._id || p).toString() === authUserId)) {
            return (0, apiResponse_1.error)(res, 'Not authorized', 401);
        }
        // Soft delete by marking as inactive
        conversation.isActive = false;
        await conversation.save();
        return (0, apiResponse_1.success)(res, { msg: 'Conversation archived' });
    }
    catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return (0, apiResponse_1.error)(res, 'Conversation not found', 404);
        }
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.archiveConversation = archiveConversation;
const shareContact = async (req, res) => {
    try {
        const conversation = await Conversation_1.default.findById(req.params.id);
        if (!conversation) {
            return (0, apiResponse_1.error)(res, 'Conversation not found', 404);
        }
        const authUser = req.user;
        if (!conversation.participants.some(p => p.toString() === authUser.id.toString())) {
            return (0, apiResponse_1.error)(res, 'Not authorized', 401);
        }
        // Add user to contactSharedBy if not already there
        if (!conversation.contactSharedBy.includes(authUser._id)) {
            conversation.contactSharedBy.push(authUser._id);
            // Add a system message to the conversation
            const systemMessage = new Message_1.default({
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
        return (0, apiResponse_1.success)(res, conversation);
    }
    catch (err) {
        console.error(err.message);
        return (0, apiResponse_1.error)(res, 'Server error');
    }
};
exports.shareContact = shareContact;
//# sourceMappingURL=messageController.js.map