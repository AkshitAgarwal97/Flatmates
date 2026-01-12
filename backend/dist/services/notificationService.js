"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifyUsers = exports.sendNotification = exports.getIo = exports.setIo = void 0;
const User_1 = __importDefault(require("../models/User"));
// We'll use a globally accessible IO instance or a way to get it
let io;
const setIo = (ioInstance) => {
    io = ioInstance;
};
exports.setIo = setIo;
const getIo = () => io;
exports.getIo = getIo;
/**
 * Send a notification to a specific user
 */
const sendNotification = async (payload) => {
    try {
        const { userId, type, content, relatedTo, relatedModel } = payload;
        // 1. Persist to Database
        const user = await User_1.default.findByIdAndUpdate(userId, {
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
        }, { new: true });
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
    }
    catch (err) {
        console.error('Error sending notification:', err);
    }
};
exports.sendNotification = sendNotification;
/**
 * Notify multiple users
 */
const notifyUsers = async (userIds, payload) => {
    const promises = userIds.map(userId => (0, exports.sendNotification)({ ...payload, userId }));
    return Promise.all(promises);
};
exports.notifyUsers = notifyUsers;
exports.default = {
    setIo: exports.setIo,
    getIo: exports.getIo,
    sendNotification: exports.sendNotification,
    notifyUsers: exports.notifyUsers
};
//# sourceMappingURL=notificationService.js.map