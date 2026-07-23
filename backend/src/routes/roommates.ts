import express from 'express';
import { searchRoommates } from '../controllers/roommateController';

const router = express.Router();

/**
 * @route   GET /api/roommates
 * @desc    Search for roommates
 * @access  Public
 */
router.get('/', searchRoommates);

export default router;
