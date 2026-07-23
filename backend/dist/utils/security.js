"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.decryptData = void 0;
const crypto_js_1 = __importDefault(require("crypto-js"));
// Use the same key as frontend
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "flatmates_secure_key_123";
const decryptData = (ciphertext) => {
    try {
        if (!ciphertext)
            return "";
        const bytes = crypto_js_1.default.AES.decrypt(ciphertext, ENCRYPTION_KEY);
        return bytes.toString(crypto_js_1.default.enc.Utf8);
    }
    catch (error) {
        console.error("Decryption failed:", error);
        return ciphertext; // Return original if decryption fails (fallback)
    }
};
exports.decryptData = decryptData;
//# sourceMappingURL=security.js.map