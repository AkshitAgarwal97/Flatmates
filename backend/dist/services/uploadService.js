"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFromCloudinary = exports.uploadToCloudinary = exports.messageAttachmentUpload = exports.propertyImageUpload = exports.avatarUpload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const crypto_1 = __importDefault(require("crypto"));
const cloudinary_1 = require("../config/cloudinary");
// ----------------------------------------------------------------------
// Multer Configurations
// ----------------------------------------------------------------------
// 1. Avatar Upload (Memory storage for Cloudinary, 5MB, images only)
const avatarStorage = multer_1.default.memoryStorage();
exports.avatarUpload = (0, multer_1.default)({
    storage: avatarStorage,
    limits: { fileSize: 5000000 }, // 5MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Error: Images only!'));
        }
    }
});
// 2. Property Image Upload (Memory storage for Cloudinary, 10MB, images only)
const propertyStorage = multer_1.default.memoryStorage();
exports.propertyImageUpload = (0, multer_1.default)({
    storage: propertyStorage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Error: Images only!'));
        }
    }
});
// 3. Message Attachment Upload (Disk storage, 10MB, images + docs)
const messageStorage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path_1.default.join(__dirname, '../../uploads/messages'));
    },
    filename: function (req, file, cb) {
        // Sanitize original filename and append a short random suffix to avoid collisions
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        const base = path_1.default.basename(file.originalname, ext)
            .replace(/[^a-zA-Z0-9-_]/g, '_')
            .slice(0, 100);
        const suffix = crypto_1.default.randomBytes(6).toString('hex');
        cb(null, `${Date.now()}-${base}-${suffix}${ext}`);
    }
});
exports.messageAttachmentUpload = (0, multer_1.default)({
    storage: messageStorage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
        const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Error: Images and Documents only!'));
        }
    }
});
const uploadToCloudinary = async (buffer, folder = 'flatmates/properties') => {
    if (!cloudinary_1.configured) {
        // ★ Fallback: Save file to local uploads directory when Cloudinary is not configured
        try {
            const fs = require('fs');
            const ext = '.jpg'; // default extension for binary image buffer uploads
            const filename = `${Date.now()}-${crypto_1.default.randomBytes(6).toString('hex')}${ext}`;
            const subFolder = folder.includes('avatars') ? 'avatars' : 'properties';
            const targetDir = path_1.default.join(__dirname, '../../uploads', subFolder);
            if (!fs.existsSync(targetDir)) {
                fs.mkdirSync(targetDir, { recursive: true });
            }
            const targetPath = path_1.default.join(targetDir, filename);
            fs.writeFileSync(targetPath, buffer);
            return {
                url: `/uploads/${subFolder}/${filename}`,
                publicId: `local-${subFolder}-${filename}`
            };
        }
        catch (localErr) {
            console.error('Local upload fallback failed:', localErr);
            throw new Error(`Upload failed: Cloudinary not configured and local fallback errored: ${localErr.message}`);
        }
    }
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.cloudinary.uploader.upload_stream({
            folder,
            eager: [{ width: 800, height: 600, crop: 'fill' }],
        }, (error, result) => {
            if (error)
                return reject(error);
            if (!result)
                return reject(new Error('No result from Cloudinary'));
            // We use the eager transformed URL if available for properties
            const secureUrl = (result.eager && result.eager[0])
                ? result.eager[0].secure_url
                : result.secure_url;
            resolve({
                url: secureUrl,
                publicId: result.public_id,
            });
        });
        uploadStream.end(buffer);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
const deleteFromCloudinary = async (publicId) => {
    if (!cloudinary_1.configured) {
        console.warn('Cloudinary is not configured. Skipping delete.');
        return;
    }
    try {
        await cloudinary_1.cloudinary.uploader.destroy(publicId);
    }
    catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
    }
};
exports.deleteFromCloudinary = deleteFromCloudinary;
//# sourceMappingURL=uploadService.js.map