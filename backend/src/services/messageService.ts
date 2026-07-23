import mongoose from 'mongoose';
import Conversation from '../models/Conversation';
import Message, { IAttachment } from '../models/Message';
import User from '../models/User';
import emailService from './emailService';
import notificationService from './notificationService';

export interface SendMessageParams {
  conversationId: string;
  senderId: string | mongoose.Types.ObjectId;
  content: string;
  attachments?: IAttachment[];
}

export const sendMessageToConversation = async (params: SendMessageParams) => {
  const { conversationId, senderId, content, attachments = [] } = params;

  // 1. Fetch conversation and participants
  const conversation = await Conversation.findById(conversationId).populate('participants');
  if (!conversation) {
    throw new Error('Conversation not found');
  }

  // 2. Block and authorization checks
  const participants = conversation.participants as any[];
  const senderIdStr = senderId.toString();
  const senderObj = participants.find(p => p._id.toString() === senderIdStr);
  const otherParticipant = participants.find(p => p._id.toString() !== senderIdStr);

  if (!senderObj) {
    throw new Error('Not authorized');
  }

  // ★ FIX #4: Compare block lists using string arrays to prevent ObjectId mismatch
  const isSenderBlocked = senderObj.blockedUsers?.some((id: any) => id.toString() === otherParticipant?._id.toString());
  const isRecipientBlocked = otherParticipant?.blockedUsers?.some((id: any) => id.toString() === senderObj._id.toString());

  if (isSenderBlocked || isRecipientBlocked) {
    throw new Error('Communication blocked');
  }

  // 3. Create the message
  const newMessage = new Message({
    conversation: conversationId,
    sender: senderId,
    content,
    attachments
  });
  const message = await newMessage.save();

  // 4. Update Conversation in a single save
  conversation.lastMessage = message._id as any;
  
  // Increment unread count for other participants
  conversation.participants.forEach((participant: any) => {
    if (participant._id.toString() !== senderIdStr) {
      const currentCount = conversation.unreadCount.get(participant._id.toString()) || 0;
      conversation.unreadCount.set(participant._id.toString(), currentCount + 1);
    }
  });

  await conversation.save();

  // 5. Fire-and-forget logic: response time tracking & email notification & in-app notifications
  setImmediate(async () => {
    try {
      // Parallelize DB calls for tracking and notifications
      const [lastOtherMessage, users] = await Promise.all([
        Message.findOne({
          conversation: conversation._id,
          sender: { $ne: senderId }
        }).sort({ createdAt: -1 }),
        User.find({ _id: { $in: [senderId, otherParticipant?._id] } }).select('name email averageResponseTime')
      ]);

      const senderUser = users.find(u => u._id.toString() === senderIdStr);
      const recipientUser = users.find(u => u._id.toString() !== senderIdStr);

      // Track response time
      if (lastOtherMessage && lastOtherMessage.createdAt && senderUser) {
        const responseTime = (new Date().getTime() - lastOtherMessage.createdAt.getTime()) / (1000 * 60); // In minutes
        const newAvg = senderUser.averageResponseTime === 0
          ? responseTime
          : (senderUser.averageResponseTime * 4 + responseTime) / 5;
          
        await User.findByIdAndUpdate(senderId, { averageResponseTime: Math.round(newAvg) });
      }

      // Email Notification
      if (recipientUser && senderUser) {
        const propertyTitle = (conversation as any).property ? 'a property' : 'your message';
        emailService.sendNewMessageNotification(
          recipientUser.email,
          senderUser.name,
          propertyTitle
        ).catch((err: any) => console.error('Failed to send email notification:', err));
      }

      // In-app Notification (Single call to notificationService)
      if (recipientUser && senderUser) {
        await notificationService.sendNotification({
          userId: recipientUser._id,
          type: 'message',
          content: `New message from ${senderUser.name}`,
          relatedTo: conversation._id.toString(),
          relatedModel: 'Conversation'
        });
      }
    } catch (err) {
      console.error('Error in background message tasks:', err);
    }
  });

  // 6. Populate and return message
  const populatedMessage = await Message.findById(message._id).populate(
    'sender',
    'name avatar'
  );

  return populatedMessage;
};
