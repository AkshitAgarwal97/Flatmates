import jwt from 'jsonwebtoken';
import { Server, Socket } from 'socket.io';
import mongoose from 'mongoose';

// Import models
import User from '../models/User';
import Conversation from '../models/Conversation';
import Message from '../models/Message';
import notificationService from './notificationService';

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

        // ★ FIX #4: Use .some() + .toString() — ObjectId !== string by reference
        if (!conversation.participants.some(p => p.toString() === socket.userId!.toString())) {
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

    // ★ FIX #2: Socket does NOT persist messages to DB.
    // The HTTP POST /conversations/:id is the single write path.
    // This handler is intentionally a no-op — real-time delivery is done
    // by messageController after saving via HTTP, using io.to().emit().
    // Keeping this handler to avoid client-side socket errors on emit.
    socket.on('send-message', (data: MessageData) => {
      // Silently ignore — messages must be sent via HTTP API, not socket directly.
      // The server will emit 'new-message' to the room after HTTP save.
      console.warn(`[socket] send-message ignored for user ${socket.userId} — use HTTP API`);
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