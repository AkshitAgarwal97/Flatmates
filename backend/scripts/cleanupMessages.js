"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
// Load environment variables once. Guard to avoid multiple calls across scripts.
if (!process.env.DOTENV_CONFIGURED) {
    dotenv_1.default.config();
    process.env.DOTENV_CONFIGURED = '1';
}
// Import models
const Message_1 = __importDefault(require("./models/Message"));
const Conversation_1 = __importDefault(require("./models/Conversation"));
const cleanupMessages = async () => {
    try {
        // Connect to MongoDB
        const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/flatmates';
        await mongoose_1.default.connect(mongoURI);
        console.log('MongoDB connected successfully');
        // Delete all messages
        const messagesResult = await Message_1.default.deleteMany({});
        console.log(`✅ Deleted ${messagesResult.deletedCount} messages`);
        // Delete all conversations
        const conversationsResult = await Conversation_1.default.deleteMany({});
        console.log(`✅ Deleted ${conversationsResult.deletedCount} conversations`);
        console.log('\n🎉 Cleanup completed successfully!');
        console.log('All old messages and conversations have been removed.');
        console.log('New messages will be properly formatted with populated sender fields.');
        // Close connection
        await mongoose_1.default.connection.close();
        console.log('\nDatabase connection closed.');
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error during cleanup:', error);
        process.exit(1);
    }
};
// Run cleanup
console.log('🧹 Starting database cleanup...\n');
cleanupMessages();
//# sourceMappingURL=cleanupMessages.js.map