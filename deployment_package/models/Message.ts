import mongoose, { Document, Schema } from 'mongoose';

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

const MessageSchema: Schema = new Schema({
  conversation: {
    type: Schema.Types.ObjectId,
    ref: 'Conversation',
    required: true
  },
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true
  },
  attachments: [{
    type: String,
    url: String,
    fileType: String
  }],
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model<IMessage>('Message', MessageSchema);