import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dnngje1bu',
    api_key: process.env.CLOUDINARY_API_KEY || '786263453112437',
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;
