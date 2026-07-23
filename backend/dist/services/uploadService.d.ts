import multer from 'multer';
export declare const avatarUpload: multer.Multer;
export declare const propertyImageUpload: multer.Multer;
export declare const messageAttachmentUpload: multer.Multer;
export interface CloudinaryUploadResult {
    url: string;
    publicId: string;
}
export declare const uploadToCloudinary: (buffer: Buffer, folder?: string) => Promise<CloudinaryUploadResult>;
export declare const deleteFromCloudinary: (publicId: string) => Promise<void>;
//# sourceMappingURL=uploadService.d.ts.map