import mongoose, { Document, Schema } from 'mongoose';

interface IOTP extends Document {
    email: string;
    otp: string;
    createdAt: Date;
}

const OTPSchema: Schema = new Schema({
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // Document will be automatically deleted after 10 minutes (600 seconds)
    }
});

// Index for faster lookups
OTPSchema.index({ email: 1, createdAt: 1 });

export default mongoose.model<IOTP>('OTP', OTPSchema);
