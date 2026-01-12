import notificationService from './notificationService';
import User from '../models/User';

jest.mock('../models/User');

describe('notificationService', () => {
    const mockUserIds = ['user1', 'user2'];
    const mockNotification = {
        type: 'match' as const,
        content: 'New match found!',
        relatedTo: 'prop1',
        relatedModel: 'Property' as const
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
        (User.findByIdAndUpdate as jest.Mock).mockResolvedValue(mockUser);

        await notificationService.notifyUsers(mockUserIds, mockNotification);

        expect(User.findByIdAndUpdate).toHaveBeenCalledTimes(2);
        expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                $push: {
                    notifications: expect.objectContaining({
                        type: mockNotification.type,
                        content: mockNotification.content
                    })
                }
            }),
            { new: true }
        );
    });

    test('notifyUsers should handle empty user list gracefully', async () => {
        await notificationService.notifyUsers([], mockNotification);
        expect(User.findByIdAndUpdate).not.toHaveBeenCalled();
    });
});
