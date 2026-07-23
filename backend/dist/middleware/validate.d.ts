import { Request, Response, NextFunction } from 'express';
import { ValidationChain } from 'express-validator';
/**
 * Validate request using express-validator
 * This is a generic validator that can be used with express-validator chains
 */
export declare const validate: (validations: ValidationChain[]) => (req: Request, res: Response, next: NextFunction) => Promise<void>;
export default validate;
//# sourceMappingURL=validate.d.ts.map