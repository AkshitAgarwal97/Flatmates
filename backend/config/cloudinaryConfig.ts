import { v2 as cloudinary } from 'cloudinary';

// Debug: Log what env vars we're seeing
console.log('Cloudinary Config Debug:', {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'MISSING',
    api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'MISSING',
    api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'MISSING',
});

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dnngje1bu',
    api_key: process.env.CLOUDINARY_API_KEY || '786263453112437',
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export default cloudinary;
