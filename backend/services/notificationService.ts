import User from '../models/User';
import mongoose from 'mongoose';

// We'll use a globally accessible IO instance or a way to get it
let io: any;

export const setIo = (ioInstance: any) => {
    io = ioInstance;
};

export const getIo = () => io;

export interface NotificationPayload {
    userId: string | mongoose.Types.ObjectId;
    type: 'message' | 'property_update' | 'match' | 'system';
    content: string;
    relatedTo?: string | mongoose.Types.ObjectId;
    relatedModel?: 'Property' | 'Conversation' | 'User';
}

/**
 * Send a notification to a specific user
 */
export const sendNotification = async (payload: NotificationPayload) => {
    try {
        const { userId, type, content, relatedTo, relatedModel } = payload;

        // 1. Persist to Database
        const user = await User.findByIdAndUpdate(
            userId,
            {
                $push: {
                    notifications: {
                        type,
                        content,
                        relatedTo,
                        relatedModel,
                        read: false,
                        createdAt: new Date()
                    }
                }
            },
            { new: true }
        );

        if (!user) {
            console.warn(`User ${userId} not found for notification`);
            return;
        }

        const newNotification = user.notifications[user.notifications.length - 1];

        // 2. Emit via Socket.io if online
        if (io) {
            io.to(userId.toString()).emit('notification', newNotification);
        }

        return newNotification;
    } catch (err) {
        console.error('Error sending notification:', err);
    }
};

/**
 * Notify multiple users
 */
export const notifyUsers = async (userIds: (string | mongoose.Types.ObjectId)[], payload: Omit<NotificationPayload, 'userId'>) => {
    const promises = userIds.map(userId => sendNotification({ ...payload, userId }));
    return Promise.all(promises);
};

export default {
    setIo,
    getIo,
    sendNotification,
    notifyUsers
};
