import { Request, Response, NextFunction } from 'express';
import passport from 'passport';

/**
 * Protect routes - requires JWT authentication
 */
export const protect = passport.authenticate('jwt', { session: false });

export default protect;

