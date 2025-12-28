import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
/**
 * Validate request using express-validator
 * This is a generic validator that can be used with express-validator chains
 */
export declare const validate: (validations: ValidationChain[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Legacy validate function for joi schemas (if needed)
 * For now, we'll use express-validator instead
 */
export declare function validateJoi(schema: any, source?: 'body' | 'query' | 'params'): (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export default validate;
//# sourceMappingURL=validate.d.ts.map