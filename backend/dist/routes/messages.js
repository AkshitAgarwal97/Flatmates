"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const express_validator_1 = require("express-validator");
const uploadService_1 = require("../services/uploadService");
const auth_1 = require("../middleware/auth");
const express_2 = require("../types/express");
const messageController_1 = require("../controllers/messageController");
const router = express_1.default.Router();
// @route   GET api/messages/conversations
// @desc    Get all conversations for a user
// @access  Private
router.get('/conversations', auth_1.protect, (0, express_2.wrapHandler)(messageController_1.getConversations));
// @route   POST api/messages/conversations
// @desc    Create a new conversation
// @access  Private
router.post('/conversations', [
    auth_1.protect,
    (0, express_validator_1.check)('recipient', 'Recipient is required').not().isEmpty(),
    (0, express_validator_1.check)('property', 'Property ID is required').optional()
], (0, express_2.wrapHandler)(messageController_1.createConversation));
// @route   GET api/messages/conversations/:id
// @desc    Get messages for a conversation
// @access  Private
router.get('/conversations/:id', auth_1.protect, (0, express_2.wrapHandler)(messageController_1.getMessages));
// @route   POST api/messages/conversations/:id
// @desc    Send a message in a conversation
// @access  Private
router.post('/conversations/:id', [
    auth_1.protect,
    uploadService_1.messageAttachmentUpload.array('attachments', 5),
    (0, express_validator_1.check)('content', 'Message content is required').not().isEmpty()
], (0, express_2.wrapHandler)(messageController_1.sendMessage));
// @route   DELETE api/messages/conversations/:id
// @desc    Archive a conversation (soft delete)
// @access  Private
router.delete('/conversations/:id', auth_1.protect, (0, express_2.wrapHandler)(messageController_1.archiveConversation));
// @route   POST api/messages/conversations/:id/share-contact
// @desc    Express interest in sharing contact details
// @access  Private
router.post('/conversations/:id/share-contact', auth_1.protect, (0, express_2.wrapHandler)(messageController_1.shareContact));
exports.default = router;
//# sourceMappingURL=messages.js.map