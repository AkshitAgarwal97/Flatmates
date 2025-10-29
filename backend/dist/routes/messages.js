"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const express_validator_1 = require("express-validator");
const router = express_1.default.Router();
// @route   GET api/messages/conversations
// @desc    Get all conversations for a user
// @access  Private
router.get('/conversations', passport_1.default.authenticate('jwt', { session: false }), async (req, res) => {
    try {
        // Import models dynamically to avoid circular dependencies
        const Conversation = require('../models/Conversation').default;
        const conversations = await Conversation.find({
            participants: req.user?._id,
            isActive: true
        })
            .populate('participants', 'name avatar')
            .populate('property', 'title images')
            .populate('lastMessage')
            .sort({ updatedAt: -1 });
        res.json(conversations);
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
            participants: { $all: [req.user?._id, recipient] },
            property: property || { $exists: false }
        });
        if (conversation) {
            // If conversation exists but is inactive, reactivate it
            if (!conversation.isActive) {
                conversation.isActive = true;
                await conversation.save();
            }
            return res.json(conversation);
        }
        // Create new conversation
        conversation = new Conversation({
            participants: [req.user?._id, recipient],
            property: property || null,
            unreadCount: { [recipient]: initialMessage ? 1 : 0 }
        });
        await conversation.save();
        // If initial message provided, create it
        if (initialMessage) {
            const message = new Message({
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
        const populatedConversation = await Conversation.findById(conversation._id)
            .populate('participants', 'name avatar')
            .populate('property', 'title images')
            .populate('lastMessage');
        res.json(populatedConversation);
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
        // Import models dynamically to avoid circular dependencies
        const Conversation = require('../models/Conversation').default;
        const Message = require('../models/Message').default;
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) {
            return res.status(404).json({ msg: 'Conversation not found' });
        }
        // Check if user is part of the conversation
        if (!conversation.participants.includes(req.user?._id)) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        // Get messages
        const messages = await Message.find({ conversation: req.params.id })
            .sort({ createdAt: 1 })
            .populate('sender', 'name avatar');
        // Mark messages as read
        await Message.updateMany({ conversation: req.params.id, sender: { $ne: req.user?._id }, read: false }, { $set: { read: true, readAt: Date.now() } });
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
        const conversation = await Conversation.findById(req.params.id);
        if (!conversation) {
            return res.status(404).json({ msg: 'Conversation not found' });
        }
        // Check if user is part of the conversation
        if (!conversation.participants.includes(req.user?._id)) {
            return res.status(401).json({ msg: 'Not authorized' });
        }
        // Create message
        const newMessage = new Message({
            conversation: req.params.id,
            sender: req.user?._id,
            content: req.body.content,
            attachments: req.body.attachments || []
        });
        const message = await newMessage.save();
        // Update conversation
        conversation.lastMessage = message._id;
        conversation.updatedAt = new Date();
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
exports.default = router;
//# sourceMappingURL=messages.js.map