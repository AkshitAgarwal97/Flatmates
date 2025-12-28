import { Router } from 'express';
import passport from 'passport';
import { getListings, getNearby } from '../controllers/listingController';

const router = Router();

// All listing endpoints require JWT auth
router.use(passport.authenticate('jwt', { session: false }));

// GET /api/listings – filter, pagination, optional bbox/radius
router.get('/', getListings);

// GET /api/listings/nearby – map clustering helper
router.get('/nearby', getNearby);

export default router;
