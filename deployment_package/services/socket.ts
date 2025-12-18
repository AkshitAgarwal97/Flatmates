import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';

// Import models
import User from '../models/User';
import Conversation from '../models/Conversation';
import Message from '../models/Message';

// Interface for JWT payload
interface JwtPayload {
  id: string;
  [key: string]: any;
}

// Interface for message data
interface MessageData {
  conversationId: string;
  content: string;
  attachments?: Array<{
    type: string;
    url: string;
    fileType?: string;
  }>;
}

// Extend Socket interface to include userId
interface CustomSocket extends Socket {
  userId?: any;
}

const socketHandler = (io: Server): void => {
  // Middleware for authentication
  io.use((socket: CustomSocket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error: Token not provided'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret') as JwtPayload;
      socket.userId = decoded.id;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: CustomSocket) => {
    console.log(`User connected: ${socket.userId}`);
    
    // Join a room with the user's ID for private messages
    socket.join(socket.userId!);
    
    // Handle joining conversation rooms
    socket.on('join-conversation', async (conversationId: string) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }
        
        // Check if user is part of the conversation
        if (!conversation.participants.includes(socket.userId!)) {
          socket.emit('error', { message: 'Not authorized to join this conversation' });
          return;
        }
        
        socket.join(`conversation:${conversationId}`);
        console.log(`User ${socket.userId} joined conversation ${conversationId}`);
      } catch (err) {
        console.error('Error joining conversation:', err);
        socket.emit('error', { message: 'Server error' });
      }
    });
    
    // Handle leaving conversation rooms
    socket.on('leave-conversation', (conversationId: string) => {
      socket.leave(`conversation:${conversationId}`);
      console.log(`User ${socket.userId} left conversation ${conversationId}`);
    });
    
    // Handle new messages
    socket.on('send-message', async (data: MessageData) => {
      try {
        const { conversationId, content, attachments } = data;
        
        const conversation = await Conversation.findById(conversationId);
        
        if (!conversation) {
          socket.emit('error', { message: 'Conversation not found' });
          return;
        }
        
        // Check if user is part of the conversation
        if (!conversation.participants.includes(socket.userId!)) {
          socket.emit('error', { message: 'Not authorized to send messages in this conversation' });
          return;
        }
        
        // Create new message
        const newMessage = new Message({
          conversation: conversationId,
          sender: socket.userId!,
          content,
          attachments: attachments || []
        });
        
        const savedMessage = await newMessage.save();
        
        // Update conversation
        conversation.lastMessage = savedMessage._id;
        conversation.updatedAt = new Date();
        
        // Increment unread count for other participants
        conversation.participants.forEach((participant: mongoose.Types.ObjectId) => {
          if (participant.toString() !== socket.userId!) {
            const currentCount = conversation.unreadCount.get(participant.toString()) || 0;
            conversation.unreadCount.set(participant.toString(), currentCount + 1);
          }
        });
        
        await conversation.save();
        
        // Populate message with sender info
        const populatedMessage = await Message.findById(savedMessage._id).populate(
          'sender',
          'name avatar'
        );
        
        // Emit to all users in the conversation
        io.to(`conversation:${conversationId}`).emit('new-message', populatedMessage);
        
        // Send notification to participants who are not in the conversation room
        conversation.participants.forEach((participant: mongoose.Types.ObjectId) => {
          if (participant.toString() !== socket.userId!) {
            // Emit to specific user's room
            io.to(participant.toString()).emit('message-notification', {
              conversationId,
              message: populatedMessage
            });
            
            // Add notification for recipient
            User.findByIdAndUpdate(participant, {
              $push: {
                notifications: {
                  type: 'message',
                  content: `New message in conversation`,
                  relatedTo: conversation._id
                }
              }
            }).catch((err: Error) => console.error('Error creating notification:', err));
          }
        });
      } catch (err) {
        console.error('Error sending message:', err);
        socket.emit('error', { message: 'Server error' });
      }
    });
    
    // Handle typing indicators
    socket.on('typing', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user-typing', {
        userId: socket.userId,
        conversationId
      });
    });
    
    socket.on('stop-typing', (conversationId: string) => {
      socket.to(`conversation:${conversationId}`).emit('user-stop-typing', {
        userId: socket.userId,
        conversationId
      });
    });
    
    // Handle read receipts
    socket.on('mark-read', async (conversationId: string) => {
      try {
        // Mark messages as read
        await Message.updateMany(
          { conversation: conversationId, sender: { $ne: socket.userId }, read: false },
          { $set: { read: true, readAt: new Date() } }
        );
        
        // Reset unread count for this user
        const conversation = await Conversation.findById(conversationId);
        if (conversation) {
          conversation.unreadCount.set(socket.userId!, 0);
          await conversation.save();
          
          // Notify other participants about read status
          socket.to(`conversation:${conversationId}`).emit('messages-read', {
            userId: socket.userId,
            conversationId
          });
        }
      } catch (err) {
        console.error('Error marking messages as read:', err);
      }
    });
    
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });
};

export default socketHandler;