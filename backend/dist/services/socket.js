"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const Conversation_1 = __importDefault(require("../models/Conversation"));
const Message_1 = __importDefault(require("../models/Message"));
const socketHandler = (io) => {
    // Middleware for authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error: Token not provided'));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
            socket.userId = decoded.id;
            next();
        }
        catch (err) {
            return next(new Error('Authentication error: Invalid token'));
        }
    });
    io.on('connection', (socket) => {
        console.log(`User connected: ${socket.userId}`);
        // Join a room with the user's ID for private messages
        socket.join(socket.userId);
        // Handle joining conversation rooms
        socket.on('join-conversation', async (conversationId) => {
            try {
                const conversation = await Conversation_1.default.findById(conversationId);
                if (!conversation) {
                    socket.emit('error', { message: 'Conversation not found' });
                    return;
                }
                // ★ FIX #4: Use .some() + .toString() — ObjectId !== string by reference
                if (!conversation.participants.some(p => p.toString() === socket.userId.toString())) {
                    socket.emit('error', { message: 'Not authorized to join this conversation' });
                    return;
                }
                socket.join(`conversation:${conversationId}`);
                console.log(`User ${socket.userId} joined conversation ${conversationId}`);
            }
            catch (err) {
                console.error('Error joining conversation:', err);
                socket.emit('error', { message: 'Server error' });
            }
        });
        // Handle leaving conversation rooms
        socket.on('leave-conversation', (conversationId) => {
            socket.leave(`conversation:${conversationId}`);
            console.log(`User ${socket.userId} left conversation ${conversationId}`);
        });
        // ★ FIX #2: Socket does NOT persist messages to DB.
        // The HTTP POST /conversations/:id is the single write path.
        // This handler is intentionally a no-op — real-time delivery is done
        // by messageController after saving via HTTP, using io.to().emit().
        // Keeping this handler to avoid client-side socket errors on emit.
        socket.on('send-message', (data) => {
            // Silently ignore — messages must be sent via HTTP API, not socket directly.
            // The server will emit 'new-message' to the room after HTTP save.
            console.warn(`[socket] send-message ignored for user ${socket.userId} — use HTTP API`);
        });
        // Handle typing indicators
        socket.on('typing', (conversationId) => {
            socket.to(`conversation:${conversationId}`).emit('user-typing', {
                userId: socket.userId,
                conversationId
            });
        });
        socket.on('stop-typing', (conversationId) => {
            socket.to(`conversation:${conversationId}`).emit('user-stop-typing', {
                userId: socket.userId,
                conversationId
            });
        });
        // Handle read receipts
        socket.on('mark-read', async (conversationId) => {
            try {
                // Mark messages as read
                await Message_1.default.updateMany({ conversation: conversationId, sender: { $ne: socket.userId }, read: false }, { $set: { read: true, readAt: new Date() } });
                // Reset unread count for this user
                const conversation = await Conversation_1.default.findById(conversationId);
                if (conversation) {
                    conversation.unreadCount.set(socket.userId, 0);
                    await conversation.save();
                    // Notify other participants about read status
                    socket.to(`conversation:${conversationId}`).emit('messages-read', {
                        userId: socket.userId,
                        conversationId
                    });
                }
            }
            catch (err) {
                console.error('Error marking messages as read:', err);
            }
        });
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
        });
    });
};
exports.default = socketHandler;
//# sourceMappingURL=socket.js.map