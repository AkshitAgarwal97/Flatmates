import express from 'express';
import { check } from 'express-validator';
import { protect } from '../middleware/auth';
import { getServices, createService } from '../controllers/serviceController';
import { wrapHandler } from '../types/express'; // Preparing for Phase 3.1

const router = express.Router();

// @route   GET api/services
// @desc    Get all services (optional filtering by city/type)
// @access  Public
router.get('/', wrapHandler(getServices));

// @route   POST api/services
// @desc    Add a service
// @access  Private (requires authentication)
router.post(
    '/',
    [
        protect,
        check('name', 'Service name is required').not().isEmpty(),
        check('type', 'Service type is required').isIn(['movers', 'cleaning', 'furniture_rental', 'internet', 'other']),
        check('description', 'Description is required').not().isEmpty(),
    ],
    wrapHandler(createService)
);

export default router;
