import mongoose, { Document, Schema } from 'mongoose';

export interface IReport extends Document {
    reporter: mongoose.Types.ObjectId;
    targetUser?: mongoose.Types.ObjectId;
    targetProperty?: mongoose.Types.ObjectId;
    reason: string;
    description: string;
    status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
    createdAt: Date;
}

const ReportSchema: Schema = new Schema({
    reporter: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    targetUser: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    targetProperty: {
        type: Schema.Types.ObjectId,
        ref: 'Property'
    },
    reason: {
        type: String,
        required: true,
        enum: ['spam', 'harassment', 'fraud', 'inappropriate_content', 'other']
    },
    description: {
        type: String
    },
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model<IReport>('Report', ReportSchema);
