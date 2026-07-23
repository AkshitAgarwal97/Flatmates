import CryptoJS from 'crypto-js';

// Use the same key as frontend
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "flatmates_secure_key_123";

export const decryptData = (ciphertext: string): string => {
    try {
        if (!ciphertext) return "";
        const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error("Decryption failed:", error);
        return ciphertext; // Return original if decryption fails (fallback)
    }
};
