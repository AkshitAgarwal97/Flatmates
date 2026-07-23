import { Request } from 'express';
/**
 * Helper function to parse JSON strings from FormData
 * When using multipart/form-data, complex objects need to be JSON-stringified
 * This function safely parses them back to objects
 */
export declare const parseFormDataJSON: (value: any) => any;
/**
 * Parse all JSON fields from request body
 * Useful for handling FormData with nested objects
 */
export declare const parseRequestBody: (req: Request, jsonFields: string[]) => any;
//# sourceMappingURL=formDataHelper.d.ts.map