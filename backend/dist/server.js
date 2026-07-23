"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.trackActivity = void 0;
const express_1 = __importDefault(require("express"));
const express_rate_limit_1 = require("express-rate-limit");
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const passport_1 = __importDefault(require("passport"));
const path_1 = __importDefault(require("path"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const fs_1 = __importDefault(require("fs"));
const dotenv_1 = __importDefault(require("dotenv"));
const User_1 = __importDefault(require("./models/User"));
// Import routes
const auth_1 = __importDefault(require("./routes/auth"));
const users_1 = __importDefault(require("./routes/users"));
const properties_1 = __importDefault(require("./routes/properties"));
const messages_1 = __importDefault(require("./routes/messages"));
const services_1 = __importDefault(require("./routes/services"));
const roommates_1 = __importDefault(require("./routes/roommates"));
// Import passport config
const passport_2 = __importDefault(require("./config/passport"));
// Import socket service
const socket_1 = __importDefault(require("./services/socket"));
// Import Property model for background jobs
const Property_1 = __importDefault(require("./models/Property"));
const notificationService_1 = __importDefault(require("./services/notificationService"));
dotenv_1.default.config();
// ★ FIX #1: PORT must be declared before server.listen() is called
const PORT = Number(process.env.PORT) || 5000;
// Initialize express app
const app = (0, express_1.default)();
// ★ Fix rate-limit X-Forwarded-For proxy trust issue when running behind NGINX gateway
app.set('trust proxy', 1);
const server = http_1.default.createServer(app);
// Allowed origins: custom domain, Vercel deployment, localhost
const allowedOrigins = [
    'https://flatmates.co.in',
    'https://www.flatmates.co.in',
    'https://frontend-ecru-nine-30.vercel.app',
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    process.env.CLIENT_URL,
].filter(Boolean);
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
            callback(null, true);
        }
        else {
            callback(new Error(`CORS blocked: ${origin}`));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};
const io = new socket_io_1.Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
        credentials: true,
    }
});
// Set io instance in notification service
notificationService_1.default.setIo(io);
// Ensure upload directories exist
const uploadsDir = path_1.default.resolve(__dirname, '../uploads');
const avatarsDir = path_1.default.join(uploadsDir, 'avatars');
const propertiesDir = path_1.default.join(uploadsDir, 'properties');
const messagesDir = path_1.default.join(uploadsDir, 'messages');
try {
    fs_1.default.mkdirSync(avatarsDir, { recursive: true });
    fs_1.default.mkdirSync(propertiesDir, { recursive: true });
    fs_1.default.mkdirSync(messagesDir, { recursive: true });
}
catch (e) {
    console.error('Failed to create upload directories:', e);
}
// Middleware
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions)); // Pre-flight for all routes
app.use('/', express_1.default.static(path_1.default.join(__dirname, '../public')));
// Serve uploaded files statically
app.use('/uploads', express_1.default.static(uploadsDir));
// Configure and initialize passport
(0, passport_2.default)(passport_1.default);
app.use(passport_1.default.initialize());
// Socket.io connection
(0, socket_1.default)(io);
// ★ FIX #11: Activity tracking — debounced, attached to route-level so req.user is populated
// (Passport only populates req.user inside routes where authenticate() runs, not at app-level middleware)
const ACTIVITY_DEBOUNCE_MS = 5 * 60 * 1000; // 5 minutes
const lastActivityUpdate = new Map();
// Evict stale entries to prevent memory leak
setInterval(() => {
    const cutoff = Date.now() - ACTIVITY_DEBOUNCE_MS * 2;
    for (const [userId, timestamp] of lastActivityUpdate) {
        if (timestamp < cutoff)
            lastActivityUpdate.delete(userId);
    }
}, ACTIVITY_DEBOUNCE_MS);
// Exported so routes can attach it after passport.authenticate()
const trackActivity = async (req, res, next) => {
    if (req.user) {
        const userId = req.user.id;
        const now = Date.now();
        const lastUpdate = lastActivityUpdate.get(userId) || 0;
        if (now - lastUpdate > ACTIVITY_DEBOUNCE_MS) {
            lastActivityUpdate.set(userId, now);
            User_1.default.findByIdAndUpdate(userId, { lastActive: new Date() }).catch((err) => console.error('Failed to update lastActive:', err));
        }
    }
    next();
};
exports.trackActivity = trackActivity;
// Rate limiting — relaxed in development to prevent blocking during active testing
const authLimiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 20 : 1000, // Limit to 20 in prod, 1000 in dev
});
// Routes — trackActivity is applied AFTER passport so req.user is populated
app.use('/api/auth', authLimiter, auth_1.default);
app.use('/api/users', exports.trackActivity, users_1.default);
app.use('/api/properties', exports.trackActivity, properties_1.default);
app.use('/api/messages', exports.trackActivity, messages_1.default);
app.use('/api/services', services_1.default);
app.use('/api/roommates', roommates_1.default);
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
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`[Error] Port ${PORT} is already in use. A backend instance is already running on this port.`);
    }
    else {
        console.error('[Error] Server error:', err);
    }
    process.exit(1);
});
// ★ FIX #8: Non-fatal unhandled rejection — background jobs (emails, notifications)
// should NOT crash the server. Only exit on truly fatal startup errors.
process.on('unhandledRejection', (reason) => {
    console.error('UNHANDLED REJECTION (non-fatal):', reason);
    // Do NOT call process.exit() here — background job failures (email, notifications)
    // must not kill the server. We log and continue.
});
process.on('uncaughtException', (err) => {
    // Synchronous uncaught exceptions ARE fatal — log and exit.
    console.error('UNCAUGHT EXCEPTION! Shutting down...', err);
    server.close(() => process.exit(1));
});
// Background job: mark properties older than 30 days as inactive
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const markExpiredProperties = async () => {
    try {
        const cutoff = new Date(Date.now() - 30 * MS_PER_DAY);
        const result = await Property_1.default.updateMany({ status: 'active', createdAt: { $lt: cutoff } }, { $set: { status: 'inactive' } });
        if (result.modifiedCount && result.modifiedCount > 0) {
            console.log(`Marked ${result.modifiedCount} properties as inactive (older than 30 days)`);
        }
    }
    catch (err) {
        console.error('Error running markExpiredProperties job:', err);
    }
};
// Run at startup and then once every 24 hours
markExpiredProperties();
setInterval(markExpiredProperties, 24 * MS_PER_DAY);
exports.default = app;
//# sourceMappingURL=server.js.map