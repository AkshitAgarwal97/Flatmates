import { RequestHandler } from 'express';
import passport from 'passport';

// Protect routes - requires JWT authentication
// Cast to RequestHandler to satisfy TypeScript overloads where middleware is used
export const protect: RequestHandler = passport.authenticate('jwt', { session: false }) as unknown as RequestHandler;

export default protect;

