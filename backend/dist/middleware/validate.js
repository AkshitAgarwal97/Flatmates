"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
exports.validateJoi = validateJoi;
const express_validator_1 = require("express-validator");
/**
 * Validate request using express-validator
 * This is a generic validator that can be used with express-validator chains
 */
const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));
        const errors = (0, express_validator_1.validationResult)(req);
        if (errors.isEmpty()) {
            return next();
        }
        res.status(400).json({ errors: errors.array() });
    };
};
exports.validate = validate;
/**
 * Legacy validate function for joi schemas (if needed)
 * For now, we'll use express-validator instead
 */
function validateJoi(schema, source = 'body') {
    return (req, res, next) => {
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
exports.default = exports.validate;
//# sourceMappingURL=validate.js.map