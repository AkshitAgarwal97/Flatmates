"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validationError = exports.error = exports.success = void 0;
/**
 * Standardised API response helpers.
 *
 * Using these everywhere means the frontend only ever needs to parse
 * one shape: `{ success: boolean, data?, message?, errors? }`.
 */
const success = (res, data, status = 200) => res.status(status).json({ success: true, data });
exports.success = success;
const error = (res, message, status = 500) => res.status(status).json({ success: false, message });
exports.error = error;
const validationError = (res, errors) => res.status(400).json({ success: false, errors });
exports.validationError = validationError;
//# sourceMappingURL=apiResponse.js.map