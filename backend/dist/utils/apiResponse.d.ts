import { Response } from 'express';
/**
 * Standardised API response helpers.
 *
 * Using these everywhere means the frontend only ever needs to parse
 * one shape: `{ success: boolean, data?, message?, errors? }`.
 */
export declare const success: <T>(res: Response, data: T, status?: number) => Response<any, Record<string, any>>;
export declare const error: (res: Response, message: string, status?: number) => Response<any, Record<string, any>>;
export declare const validationError: (res: Response, errors: any[]) => Response<any, Record<string, any>>;
//# sourceMappingURL=apiResponse.d.ts.map