"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToS3 = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const path_1 = __importDefault(require("path"));
const s3Client = new client_s3_1.S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});
const uploadFileToS3 = async (fileBuffer, originalName, mimeType) => {
    const bucketName = process.env.AWS_BUCKET_NAME;
    if (!bucketName) {
        throw new Error("AWS_BUCKET_NAME is not defined in environment variables");
    }
    const ext = path_1.default.extname(originalName).toLowerCase();
    const base = path_1.default.basename(originalName, ext).replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 100);
    const fileName = `properties/${Date.now()}-${base}${ext}`;
    const command = new client_s3_1.PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: fileBuffer,
        ContentType: mimeType,
        // ACL: 'public-read', // Optional: depending on bucket settings, might not need this if bucket policy covers it
    });
    await s3Client.send(command);
    // Return the URL
    // Virtual-hosted-style URL: https://bucket-name.s3.region.amazonaws.com/key
    return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;
};
exports.uploadFileToS3 = uploadFileToS3;
//# sourceMappingURL=s3Service.js.map