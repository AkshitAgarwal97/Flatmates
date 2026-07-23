import mongoose from 'mongoose';
import { IAttachment } from '../models/Message';
export interface SendMessageParams {
    conversationId: string;
    senderId: string | mongoose.Types.ObjectId;
    content: string;
    attachments?: IAttachment[];
}
export declare const sendMessageToConversation: (params: SendMessageParams) => Promise<(mongoose.Document<unknown, {}, import("../models/Message").IMessage> & import("../models/Message").IMessage & {
    _id: mongoose.Types.ObjectId;
}) | null>;
//# sourceMappingURL=messageService.d.ts.map