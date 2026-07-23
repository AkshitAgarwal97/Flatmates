import { Response } from 'express';

/**
 * Standardised API response helpers.
 *
 * Using these everywhere means the frontend only ever needs to parse
 * one shape: `{ success: boolean, data?, message?, errors? }`.
 */

export const success = <T>(res: Response, data: T, status = 200) =>
  res.status(status).json({ success: true, data });

export const error = (res: Response, message: string, status = 500) =>
  res.status(status).json({ success: false, message });

export const validationError = (res: Response, errors: any[]) =>
  res.status(400).json({ success: false, errors });
