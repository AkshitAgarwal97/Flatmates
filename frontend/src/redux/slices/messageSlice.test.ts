import messageReducer, {
    clearCurrentConversation,
    receiveMessage,
    markConversationAsRead
} from './messageSlice';

describe('messageSlice', () => {
    const initialState = {
        conversations: [],
        currentConversation: null,
        messages: [],
        loading: false,
        error: null
    };

    it('should handle initial state', () => {
        expect(messageReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle clearCurrentConversation', () => {
        const stateWithMessages = {
            ...initialState,
            currentConversation: { _id: '1' } as any,
            messages: [{ _id: 'm1' } as any]
        };
        const actual = messageReducer(stateWithMessages, clearCurrentConversation());
        expect(actual.currentConversation).toBeNull();
        expect(actual.messages).toHaveLength(0);
    });

    it('should handle receiveMessage in current conversation', () => {
        const state = {
            ...initialState,
            currentConversation: { _id: 'conv1' } as any,
            conversations: [{ _id: 'conv1', unreadCount: 0 } as any]
        };
        const newMessage = { _id: 'm2', content: 'hello', conversation: 'conv1' } as any;
        const actual = messageReducer(state, receiveMessage(newMessage));

        expect(actual.messages).toHaveLength(1);
        expect(actual.messages[0]).toEqual(newMessage);
        expect(actual.conversations[0].lastMessage).toEqual(newMessage);
        expect(actual.conversations[0].unreadCount).toBe(0); // If current, unread doesn't increase
    });

    it('should handle receiveMessage in different conversation', () => {
        const state = {
            ...initialState,
            conversations: [{ _id: 'conv2', unreadCount: 0 } as any]
        };
        const newMessage = { _id: 'm3', content: 'hi', conversation: 'conv2' } as any;
        const actual = messageReducer(state, receiveMessage(newMessage));

        expect(actual.messages).toHaveLength(0); // Only current conversation gets messages
        expect(actual.conversations[0].unreadCount).toBe(1);
    });

    it('should handle markConversationAsRead', () => {
        const state = {
            ...initialState,
            conversations: [{ _id: 'conv1', unreadCount: 5 } as any]
        };
        const actual = messageReducer(state, markConversationAsRead('conv1'));
        expect(actual.conversations[0].unreadCount).toBe(0);
    });
});
