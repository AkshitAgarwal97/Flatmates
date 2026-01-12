"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const express_validator_1 = require("express-validator");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const Conversation_1 = __importDefault(require("../models/Conversation"));
const Message_1 = __importDefault(require("../models/Message"));
const emailService_1 = __importDefault(require("../services/emailService"));
const router = express_1.default.Router();
// Set up multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(__dirname, '../uploads/messages'));
    },
    filename: function (req, file, cb) {
        // Sanitize original filename and append a short random suffix to avoid collisions
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const base = path_1.default.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9-_]/g, '_')
            .slice(0, 100);
        const suffix = crypto_1.default.randomBytes(6).toString('hex');
        cb(null, `${Date.now()}-${base}-${suffix}${ext}`);
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        if (extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Error: Images and documents only!'));
        }
    }
});
// @route   GET api/messages/conversations
// @desc    Get all conversations for a user
// @access  Private
router.get('/conversations', passport_1.default.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const conversations = await Conversation_1.default.find({
            participants: req.user?._id,
            isActive: true
        })
            .populate('participants', 'name avatar')
            .populate('property', 'title images')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });
        // Transform unreadCount to number for the requesting user
        const conversationsWithUnread = conversations.map((conv) => {
            const convObj = conv.toObject();
            const unread = conv.unreadCount.get(req.user?._id.toString()) || 0;
            return { ...convObj, unreadCount: unread };
        });
        res.json(conversationsWithUnread);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   POST api/messages/conversations
// @desc    Create a new conversation
// @access  Private
router.post('/conversations', [
    passport_1.default.authenticate('jwt', { session: false }),
    (0, express_validator_1.check)('recipient', 'Recipient is required').not().isEmpty(),
    (0, express_validator_1.check)('property', 'Property ID is required').optional()
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Use top-level model imports
        const { recipient, property, initialMessage } = req.body;
        // Check if recipient is blocked or blocking the sender
        const User = require('../models/User').default;
        const sender = await User.findById(req.user.id);
        const recipientUser = await User.findById(recipient);
        if (!recipientUser)
            return res.status(404).json({ msg: 'Recipient not found' });
        if (sender.blockedUsers?.includes(recipient) || recipientUser.blockedUsers?.includes(sender._id)) {
            return res.status(403).json({ msg: 'Communication blocked' });
        }
        if (recipient === req.user.id.toString()) {
            return res.status(400).json({ msg: 'You cannot message yourself' });
        }
        // Check if conversation already exists
        let conversation = await Conversation_1.default.findOne({
            participants: { $all: [req.user?._id, recipient] },
            property: property || { $exists: false }
        });
        if (conversation) {
            // If conversation exists but is inactive, reactivate it
            if (!conversation.isActive) {
                conversation.isActive = true;
                await conversation.save();
            }
            // Populate and return existing conversation
            const populatedExisting = await Conversation_1.default.findById(conversation._id)
                .populate('participants', 'name avatar')
                .populate('property', 'title images')
                .populate({
                path: 'lastMessage',
                populate: { path: 'sender', select: 'name avatar' }
            });
            if (!populatedExisting)
                return res.status(500).send('Server error');
            const convObj = populatedExisting.toObject();
            const unread = conversation.unreadCount.get(req.user?._id.toString()) || 0;
            return res.json({ ...convObj, unreadCount: unread });
        }
        // Create new conversation
        conversation = new Conversation_1.default({
            participants: [req.user?._id, recipient],
            property: property || null,
            unreadCount: { [recipient]: initialMessage ? 1 : 0 }
        });
        await conversation.save();
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
            await User.findByIdAndUpdate(recipient, {
                $push: {
                    notifications: {
                        type: 'message',
                        content: `New message from ${req.user?.name}`,
                        relatedTo: conversation._id
                    }
                }
            });
        }
        // Populate and return conversation
        const populatedConversation = await Conversation_1.default.findById(conversation._id)
            .populate('participants', 'name avatar')
            .populate('property', 'title images')
            .populate({
            path: 'lastMessage',
            populate: { path: 'sender', select: 'name avatar' }
        });
        if (!populatedConversation)
            return res.status(500).send('Server error');
        const convObj = populatedConversation.toObject();
        // For new conversation creator, unread count is 0
        const unread = 0;
        res.json({ ...convObj, unreadCount: unread });
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   GET api/messages/conversations/:id
// @desc    Get messages for a conversation
// @access  Private
router.get('/conversations/:id', passport_1.default.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Use top-level model imports
        const conversation = await Conversation_1.default.findById(req.params.id);
        if (!conversation) {
            return res.status(404).json({ msg: 'Conversation not found' });
        }
        // Check if user is part of the conversation
        if (!conversation.participants.includes(req.user?._id)) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        // Get messages
        const messages = await Message_1.default.find({ conversation: req.params.id })
            .sort({ createdAt: 1 })
            .populate('sender', 'name avatar');
        // Mark messages as read
        await Message_1.default.updateMany({ conversation: req.params.id, sender: { $ne: req.user?._id }, read: false }, { $set: { read: true, readAt: Date.now() } });
        // Reset unread count for this user
        conversation.unreadCount.set(req.user?._id.toString(), 0);
        await conversation.save();
        res.json(messages);
    }
    catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Conversation not found' });
        }
        res.status(500).send('Server error');
    }
});
// @route   POST api/messages/conversations/:id
// @desc    Send a message in a conversation
// @access  Private
router.post('/conversations/:id', [
    passport_1.default.authenticate('jwt', { session: false }),
    upload.array('attachments', 5),
    (0, express_validator_1.check)('content', 'Message content is required').not().isEmpty()
], async (req, res) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        // Import models dynamically to avoid circular dependencies
        const Conversation = require('../models/Conversation').default;
        const Message = require('../models/Message').default;
        const User = require('../models/User').default;
        const senderId = req.user?._id;
        const conversation = await Conversation.findById(req.params.id).populate('participants');
        if (!conversation) {
            return res.status(404).json({ msg: 'Conversation not found' });
        }
        // Check for blocked users in the conversation
        const participants = conversation.participants;
        const authUserId = req.user.id;
        const otherParticipant = participants.find(p => p._id.toString() !== authUserId);
        const authUserObj = participants.find(p => p._id.toString() === authUserId);
        if (authUserObj?.blockedUsers?.includes(otherParticipant?._id) || otherParticipant?.blockedUsers?.includes(authUserObj?._id)) {
            return res.status(403).json({ msg: 'Communication blocked' });
        }
        // Check if user is part of the conversation
        if (!conversation.participants.some((p) => (p._id || p).toString() === req.user?._id.toString())) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        // Create message
        const newMessage = new Message({
            conversation: req.params.id,
            sender: senderId,
            content: req.body.content,
            attachments: req.body.attachments || []
        });
        // Handle file uploads if any
        if (req.files && Array.isArray(req.files)) {
            const files = req.files;
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
        await conversation.save();
        // Track response time
        const lastOtherMessage = await Message.findOne({
            conversation: conversation._id,
            sender: { $ne: senderId }
        }).sort({ createdAt: -1 });
        if (lastOtherMessage) {
            const responseTime = (new Date().getTime() - lastOtherMessage.createdAt.getTime()) / (1000 * 60); // In minutes
            const User = require('../models/User').default;
            const senderUser = await User.findById(senderId);
            if (senderUser) {
                // Weighted average (recent responses matter more)
                const newAvg = senderUser.averageResponseTime === 0
                    ? responseTime
                    : (senderUser.averageResponseTime * 4 + responseTime) / 5;
                await User.findByIdAndUpdate(senderId, { averageResponseTime: Math.round(newAvg) });
            }
        }
        // Get sender and recipient info for email notification in a single query to avoid N+1
        const recipientId = conversation.participants.find((p) => p.toString() !== req.user?._id.toString());
        let sender = null;
        let recipient = null;
        if (senderId && recipientId) {
            const users = await User.find({ _id: { $in: [senderId, recipientId] } }).select('name email');
            for (const u of users) {
                if (u._id.toString() === senderId.toString())
                    sender = u;
                if (u._id.toString() === recipientId.toString())
                    recipient = u;
            }
        }
        // Send email notification to recipient (fire-and-forget)
        if (recipient && sender) {
            const propertyTitle = conversation.propertyId ? 'a property' : 'your message';
            setImmediate(() => {
                emailService_1.default.sendNewMessageNotification(recipient.email, sender.name, propertyTitle).catch((err) => console.error('Failed to send email notification:', err));
            });
        }
        // Increment unread count for other participants
        conversation.participants.forEach((participant) => {
            if (participant.toString() !== req.user?._id.toString()) {
                const currentCount = conversation.unreadCount.get(participant.toString()) || 0;
                conversation.unreadCount.set(participant.toString(), currentCount + 1);
                // Add notification for recipient
                User.findByIdAndUpdate(participant, {
                    $push: {
                        notifications: {
                            type: 'message',
                            content: `New message from ${req.user?.name}`,
                            relatedTo: conversation._id
                        }
                    }
                }).catch((err) => console.error('Error creating notification:', err));
            }
        });
        await conversation.save();
        // Populate and return message
        const populatedMessage = await Message.findById(message._id).populate('sender', 'name avatar');
        res.json(populatedMessage);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
// @route   DELETE api/messages/conversations/:id
// @desc    Archive a conversation (soft delete)
// @access  Private
router.delete('/conversations/:id', passport_1.default.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Import models dynamically to avoid circular dependencies
        const Conversation = require('../models/Conversation').default;
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) {
            return res.status(404).json({ msg: 'Conversation not found' });
        }
        // Check if user is part of the conversation
        if (!conversation.participants.includes(req.user?._id)) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        // Soft delete by marking as inactive
        conversation.isActive = false;
        await conversation.save();
        res.json({ msg: 'Conversation archived' });
    }
    catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Conversation not found' });
        }
        res.status(500).send('Server error');
    }
});
// @route   POST api/messages/conversations/:id/share-contact
// @desc    Express interest in sharing contact details
// @access  Private
router.post('/conversations/:id/share-contact', passport_1.default.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        const conversation = await Conversation_1.default.findById(req.params.id);
        if (!conversation) {
            return res.status(404).json({ msg: 'Conversation not found' });
        }
        const authUser = req.user;
        if (!conversation.participants.some(p => p.toString() === authUser.id.toString())) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        // Add user to contactSharedBy if not already there
        if (!conversation.contactSharedBy.includes(authUser._id)) {
            conversation.contactSharedBy.push(authUser._id);
            // Add a system message to the conversation
            const Message = require('../models/Message').default;
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
        res.json(conversation);
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});
exports.default = router;
//# sourceMappingURL=messages.js.map