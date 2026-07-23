import express from 'express';
import { check } from 'express-validator';
import { messageAttachmentUpload } from '../services/uploadService';
import { protect } from '../middleware/auth';
import { wrapHandler } from '../types/express';
import {
  getConversations,
  createConversation,
  getMessages,
  sendMessage,
  archiveConversation,
  shareContact
} from '../controllers/messageController';

const router = express.Router();

// @route   GET api/messages/conversations
// @desc    Get all conversations for a user
// @access  Private
router.get(
  '/conversations',
  protect,
  wrapHandler(getConversations)
);

// @route   POST api/messages/conversations
// @desc    Create a new conversation
// @access  Private
router.post(
  '/conversations',
  [
    protect,
    check('recipient', 'Recipient is required').not().isEmpty(),
    check('property', 'Property ID is required').optional()
  ],
  wrapHandler(createConversation)
);

// @route   GET api/messages/conversations/:id
// @desc    Get messages for a conversation
// @access  Private
router.get(
  '/conversations/:id',
  protect,
  wrapHandler(getMessages)
);

// @route   POST api/messages/conversations/:id
// @desc    Send a message in a conversation
// @access  Private
router.post(
  '/conversations/:id',
  [
    protect,
    messageAttachmentUpload.array('attachments', 5),
    check('content', 'Message content is required').not().isEmpty()
  ],
  wrapHandler(sendMessage)
);

// @route   DELETE api/messages/conversations/:id
// @desc    Archive a conversation (soft delete)
// @access  Private
router.delete(
  '/conversations/:id',
  protect,
  wrapHandler(archiveConversation)
);

// @route   POST api/messages/conversations/:id/share-contact
// @desc    Express interest in sharing contact details
// @access  Private
router.post(
  '/conversations/:id/share-contact',
  protect,
  wrapHandler(shareContact)
);

export default router;
