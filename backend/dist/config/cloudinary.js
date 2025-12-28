"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configured = exports.cloudinary = void 0;
const cloudinary_1 = require("cloudinary");
Object.defineProperty(exports, "cloudinary", { enumerable: true, get: function () { return cloudinary_1.v2; } });
const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudKey = process.env.CLOUDINARY_API_KEY;
const cloudSecret = process.env.CLOUDINARY_API_SECRET;
let configured = false;
exports.configured = configured;
if (cloudName && cloudKey && cloudSecret) {
    try {
        cloudinary_1.v2.config({
            cloud_name: cloudName,
            api_key: cloudKey,
            api_secret: cloudSecret,
        });
        exports.configured = configured = true;
        console.log('Cloudinary configured');
    }
    catch (err) {
        console.warn('Failed to configure Cloudinary:', err);
    }
}
else {
    console.warn('Cloudinary environment variables missing; uploads will be skipped');
}
//# sourceMappingURL=cloudinary.js.map