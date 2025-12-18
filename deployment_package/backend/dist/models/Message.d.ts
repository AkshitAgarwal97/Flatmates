import mongoose, { Document } from 'mongoose';
export interface IAttachment {
    type?: string;
    url: string;
    fileType?: string;
}
export interface IMessage extends Document {
    conversation: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    content: string;
    attachments: IAttachment[];
    read: boolean;
    readAt?: Date;
    createdAt: Date;
}
declare const _default: mongoose.Model<IMessage, {}, {}, {}, mongoose.Document<unknown, {}, IMessage> & IMessage & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Message.d.ts.map