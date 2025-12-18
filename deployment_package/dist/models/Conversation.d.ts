import mongoose, { Document } from 'mongoose';
export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[];
    property?: mongoose.Types.ObjectId;
    lastMessage?: mongoose.Types.ObjectId;
    unreadCount: Map<string, number>;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IConversation, {}, {}, {}, mongoose.Document<unknown, {}, IConversation> & IConversation & {
    _id: mongoose.Types.ObjectId;
}, any>;
export default _default;
//# sourceMappingURL=Conversation.d.ts.map