import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';

/**
 * Validate request using express-validator
 * This is a generic validator that can be used with express-validator chains
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({ errors: errors.array() });
  };
};

/**
 * Legacy validate function for joi schemas (if needed)
 * For now, we'll use express-validator instead
 */
export function validateJoi(schema: any, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, res: Response, next: NextFunction) => {
    const data = source === 'body' ? req.body : source === 'query' ? req.query : req.params;
    const { error } = schema.validate(data);
    
    if (error) {
      return res.status(400).json({ 
        errors: [{ msg: error.details[0].message }] 
      });
    }
    
    next();
  };
}

export default validate;

