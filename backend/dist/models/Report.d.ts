import mongoose, { Document } from 'mongoose';
export interface IReport extends Document {
    reporter: mongoose.Types.ObjectId;
    targetUser?: mongoose.Types.ObjectId;
    targetProperty?: mongoose.Types.ObjectId;
    reason: string;
    description: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    createdAt: Date;
}
declare const _default: mongoose.Model<IReport, {}, {}, {}, mongoose.Document<unknown, {}, IReport> & IReport & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Report.d.ts.map