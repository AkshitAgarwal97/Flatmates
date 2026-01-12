import mongoose from 'mongoose';
export declare const setIo: (ioInstance: any) => void;
export declare const getIo: () => any;
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
export declare const sendNotification: (payload: NotificationPayload) => Promise<import("../models/User").INotification | undefined>;
/**
 * Notify multiple users
 */
export declare const notifyUsers: (userIds: (string | mongoose.Types.ObjectId)[], payload: Omit<NotificationPayload, "userId">) => Promise<(import("../models/User").INotification | undefined)[]>;
declare const _default: {
    setIo: (ioInstance: any) => void;
    getIo: () => any;
    sendNotification: (payload: NotificationPayload) => Promise<import("../models/User").INotification | undefined>;
    notifyUsers: (userIds: (string | mongoose.Types.ObjectId)[], payload: Omit<NotificationPayload, "userId">) => Promise<(import("../models/User").INotification | undefined)[]>;
};
export default _default;
//# sourceMappingURL=notificationService.d.ts.map