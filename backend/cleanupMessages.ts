import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables once. Guard to avoid multiple calls across scripts.
if (!process.env.DOTENV_CONFIGURED) {
    dotenv.config();
    process.env.DOTENV_CONFIGURED = '1';
}

// Import models
import Message from './models/Message';
import Conversation from './models/Conversation';

const cleanupMessages = async () => {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/flatmates';
        await mongoose.connect(mongoURI);
        console.log('MongoDB connected successfully');

        // Delete all messages
        const messagesResult = await Message.deleteMany({});
        console.log(`✅ Deleted ${messagesResult.deletedCount} messages`);

        // Delete all conversations
        const conversationsResult = await Conversation.deleteMany({});
        console.log(`✅ Deleted ${conversationsResult.deletedCount} conversations`);

        console.log('\n🎉 Cleanup completed successfully!');
        console.log('All old messages and conversations have been removed.');
        console.log('New messages will be properly formatted with populated sender fields.');

        // Close connection
        await mongoose.connection.close();
        console.log('\nDatabase connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
};

// Run cleanup
console.log('🧹 Starting database cleanup...\n');
cleanupMessages();
