import mongoose, { Document } from 'mongoose';
interface IOTP extends Document {
    email: string;
    otp: string;
    createdAt: Date;
}
declare const _default: mongoose.Model<IOTP, {}, {}, {}, mongoose.Document<unknown, {}, IOTP> & IOTP & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=OTP.d.ts.map