"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const properties_1 = __importDefault(require("./routes/properties"));
const messages_1 = __importDefault(require("./routes/messages"));
// Import passport config
const passport_2 = __importDefault(require("./config/passport"));
// Import socket service
const socket_1 = __importDefault(require("./services/socket"));
dotenv_1.default.config();
// Initialize express app
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || 'http://localhost:3000',
        methods: ['GET', 'POST']
    }
});
// Ensure upload directories exist
const uploadsDir = path_1.default.join(__dirname, 'uploads');
const avatarsDir = path_1.default.join(uploadsDir, 'avatars');
const propertiesDir = path_1.default.join(uploadsDir, 'properties');
try {
    fs_1.default.mkdirSync(avatarsDir, { recursive: true });
    fs_1.default.mkdirSync(propertiesDir, { recursive: true });
}
catch (e) {
    console.error('Failed to create upload directories:', e);
}
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)());
// Serve uploaded files statically
app.use('/uploads', express_1.default.static(uploadsDir));
// Configure and initialize passport
(0, passport_2.default)(passport_1.default);
app.use(passport_1.default.initialize());
// Socket.io connection
(0, socket_1.default)(io);
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/users', users_1.default);
app.use('/api/properties', properties_1.default);
app.use('/api/messages', messages_1.default);
// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express_1.default.static(path_1.default.join(__dirname, '../frontend/build')));
    app.get('*', (req, res) => {
        res.sendFile(path_1.default.resolve(__dirname, '../frontend', 'build', 'index.html'));
    });
}
// Connect to MongoDB
mongoose_1.default
    .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flatmates')
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.log('MongoDB connection error:', err));
// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send({ message: 'Server error', error: err.message });
});
// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
exports.default = app;
//# sourceMappingURL=server.js.map