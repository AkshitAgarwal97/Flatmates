import CryptoJS from 'crypto-js';

// Use a consistent key for both frontend and backend
// In production, this should be in .env
const ENCRYPTION_KEY = process.env.REACT_APP_ENCRYPTION_KEY || "flatmates_secure_key_123";

export const encryptData = (data: string): string => {
    if (!data) return "";
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
};
