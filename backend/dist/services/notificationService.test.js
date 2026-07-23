"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const notificationService_1 = __importDefault(require("./notificationService"));
const User_1 = __importDefault(require("../models/User"));
jest.mock('../models/User');
describe('notificationService', () => {
    const mockUserIds = ['user1', 'user2'];
    const mockNotification = {
        type: 'match',
        content: 'New match found!',
        relatedTo: 'prop1',
        relatedModel: 'Property'
    };
    beforeEach(() => {
        jest.clearAllMocks();
    });
    test('notifyUsers should update user documents with new notification', async () => {
        // Mock User.findByIdAndUpdate
        const mockUser = {
            _id: 'user1',
            notifications: [{ ...mockNotification, read: false, createdAt: new Date() }]
        };
        User_1.default.findByIdAndUpdate.mockResolvedValue(mockUser);
        await notificationService_1.default.notifyUsers(mockUserIds, mockNotification);
        expect(User_1.default.findByIdAndUpdate).toHaveBeenCalledTimes(2);
        expect(User_1.default.findByIdAndUpdate).toHaveBeenCalledWith(expect.any(String), expect.objectContaining({
            $push: {
                notifications: expect.objectContaining({
                    type: mockNotification.type,
                    content: mockNotification.content
                })
            }
        }), { new: true });
    });
    test('notifyUsers should handle empty user list gracefully', async () => {
        await notificationService_1.default.notifyUsers([], mockNotification);
        expect(User_1.default.findByIdAndUpdate).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=notificationService.test.js.map