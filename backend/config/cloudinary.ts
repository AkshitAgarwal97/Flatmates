import { v2 as cloudinary } from 'cloudinary';

const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
const cloudKey = process.env.CLOUDINARY_API_KEY;
const cloudSecret = process.env.CLOUDINARY_API_SECRET;

let configured = false;
if (cloudName && cloudKey && cloudSecret) {
  try {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: cloudKey,
      api_secret: cloudSecret,
    });
    configured = true;
    console.log('Cloudinary configured');
  } catch (err) {
    console.warn('Failed to configure Cloudinary:', err);
  }
} else {
  console.warn('Cloudinary environment variables missing; uploads will be skipped');
}

export { cloudinary, configured };
