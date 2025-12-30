import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import path from 'path';

const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
});

export const uploadFileToS3 = async (
    fileBuffer: Buffer,
    originalName: string,
    mimeType: string
): Promise<string> => {
    const bucketName = process.env.AWS_BUCKET_NAME;

    if (!bucketName) {
        throw new Error("AWS_BUCKET_NAME is not defined in environment variables");
    }

    const ext = path.extname(originalName).toLowerCase();
    const base = path.basename(originalName, ext).replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 100);
    const fileName = `properties/${Date.now()}-${base}${ext}`;

    const command = new PutObjectCommand({
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
