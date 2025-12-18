"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseRequestBody = exports.parseFormDataJSON = void 0;
/**
 * Helper function to parse JSON strings from FormData
 * When using multipart/form-data, complex objects need to be JSON-stringified
 * This function safely parses them back to objects
 */
const parseFormDataJSON = (value) => {
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        }
        catch (e) {
            // If parsing fails, return the original value
            return value;
        }
    }
    return value;
};
exports.parseFormDataJSON = parseFormDataJSON;
/**
 * Parse all JSON fields from request body
 * Useful for handling FormData with nested objects
 */
const parseRequestBody = (req, jsonFields) => {
    const parsed = {};
    for (const key in req.body) {
        if (jsonFields.includes(key)) {
            parsed[key] = (0, exports.parseFormDataJSON)(req.body[key]);
        }
        else {
            parsed[key] = req.body[key];
        }
    }
    return parsed;
};
exports.parseRequestBody = parseRequestBody;
//# sourceMappingURL=formDataHelper.js.map