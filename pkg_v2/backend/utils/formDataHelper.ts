import { Request } from 'express';

/**
 * Helper function to parse JSON strings from FormData
 * When using multipart/form-data, complex objects need to be JSON-stringified
 * This function safely parses them back to objects
 */
export const parseFormDataJSON = (value: any): any => {
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch (e) {
            // If parsing fails, return the original value
            return value;
        }
    }
    return value;
};

/**
 * Parse all JSON fields from request body
 * Useful for handling FormData with nested objects
 */
export const parseRequestBody = (req: Request, jsonFields: string[]): any => {
    const parsed: any = {};

    for (const key in req.body) {
        if (jsonFields.includes(key)) {
            parsed[key] = parseFormDataJSON(req.body[key]);
        } else {
            parsed[key] = req.body[key];
        }
    }

    return parsed;
};
