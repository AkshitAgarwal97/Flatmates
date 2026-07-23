import { Request, Response, RequestHandler } from 'express';
import mongoose from 'mongoose';

export const wrapHandler = (
  fn: (req: any, res: any) => Promise<any> | any
): RequestHandler => fn as unknown as RequestHandler;

/**
 * Authenticated Express request — attaches the JWT-decoded user payload.
 * 
 * Previously duplicated in routes/auth.ts, routes/properties.ts,
 * routes/users.ts, and routes/messages.ts. Now a single source of truth.
 */
export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    _id: mongoose.Types.ObjectId;
    name: string;
    [key: string]: any;
  };
}

/**
 * JWT payload used when signing/verifying tokens.
 */
export interface JWTPayload {
  id: string;
}
