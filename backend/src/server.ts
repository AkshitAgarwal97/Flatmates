import express from 'express';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import path from 'path';
import http from 'http';
import { Server as SocketIo } from 'socket.io';
import fs from 'fs';
import dotenv from 'dotenv';
import User from './models/User';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import propertyRoutes from './routes/properties';
import messageRoutes from './routes/messages';
import serviceRoutes from './routes/services';
import roommateRoutes from './routes/roommates';

// Import passport config
import configurePassport from './config/passport';

// Import socket service
import socketHandler from './services/socket';
// Import Property model for background jobs
import Property from './models/Property';
import notificationService from './services/notificationService';

dotenv.config();

// ★ FIX #1: PORT must be declared before server.listen() is called
const PORT = Number(process.env.PORT) || 5000;

// Initialize express app
const app = express();

// ★ Fix rate-limit X-Forwarded-For proxy trust issue when running behind NGINX gateway
app.set('trust proxy', 1);

const server = http.createServer(app);
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
].filter(Boolean) as string[];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes(origin.replace(/\/$/, ''))) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
};

const io = new SocketIo(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Set io instance in notification service
notificationService.setIo(io);

// Ensure upload directories exist
const uploadsDir = path.resolve(__dirname, '../uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
const propertiesDir = path.join(uploadsDir, 'properties');
const messagesDir = path.join(uploadsDir, 'messages');
try {
  fs.mkdirSync(avatarsDir, { recursive: true });
  fs.mkdirSync(propertiesDir, { recursive: true });
  fs.mkdirSync(messagesDir, { recursive: true });
} catch (e) {
  console.error('Failed to create upload directories:', e);
}

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Pre-flight for all routes
app.use('/', express.static(path.join(__dirname, '../public')))

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Configure and initialize passport
configurePassport(passport);
app.use(passport.initialize());

// Socket.io connection
socketHandler(io);

// ★ FIX #11: Activity tracking — debounced, attached to route-level so req.user is populated
// (Passport only populates req.user inside routes where authenticate() runs, not at app-level middleware)
const ACTIVITY_DEBOUNCE_MS = 5 * 60 * 1000; // 5 minutes
const lastActivityUpdate = new Map<string, number>();

// Evict stale entries to prevent memory leak
setInterval(() => {
  const cutoff = Date.now() - ACTIVITY_DEBOUNCE_MS * 2;
  for (const [userId, timestamp] of lastActivityUpdate) {
    if (timestamp < cutoff) lastActivityUpdate.delete(userId);
  }
}, ACTIVITY_DEBOUNCE_MS);

// Exported so routes can attach it after passport.authenticate()
export const trackActivity = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (req.user) {
    const userId = (req.user as any).id;
    const now = Date.now();
    const lastUpdate = lastActivityUpdate.get(userId) || 0;
    if (now - lastUpdate > ACTIVITY_DEBOUNCE_MS) {
      lastActivityUpdate.set(userId, now);
      User.findByIdAndUpdate(userId, { lastActive: new Date() }).catch(
        (err: any) => console.error('Failed to update lastActive:', err)
      );
    }
  }
  next();
};

// Rate limiting — relaxed in development to prevent blocking during active testing
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 20 : 1000, // Limit to 20 in prod, 1000 in dev
});

// Routes — trackActivity is applied AFTER passport so req.user is populated
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', trackActivity, userRoutes);
app.use('/api/properties', trackActivity, propertyRoutes);
app.use('/api/messages', trackActivity, messageRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/roommates', roommateRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI || 'mongodb://localhost:27017/flatmates')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).send({ message: 'Server error', error: err.message });
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`[Error] Port ${PORT} is already in use. A backend instance is already running on this port.`);
  } else {
    console.error('[Error] Server error:', err);
  }
  process.exit(1);
});

// ★ FIX #8: Non-fatal unhandled rejection — background jobs (emails, notifications)
// should NOT crash the server. Only exit on truly fatal startup errors.
process.on('unhandledRejection', (reason: any) => {
  console.error('UNHANDLED REJECTION (non-fatal):', reason);
  // Do NOT call process.exit() here — background job failures (email, notifications)
  // must not kill the server. We log and continue.
});

process.on('uncaughtException', (err: Error) => {
  // Synchronous uncaught exceptions ARE fatal — log and exit.
  console.error('UNCAUGHT EXCEPTION! Shutting down...', err);
  server.close(() => process.exit(1));
});

// Background job: mark properties older than 30 days as inactive
const MS_PER_DAY = 24 * 60 * 60 * 1000;
const markExpiredProperties = async () => {
  try {
    const cutoff = new Date(Date.now() - 30 * MS_PER_DAY);
    const result = await Property.updateMany(
      { status: 'active', createdAt: { $lt: cutoff } },
      { $set: { status: 'inactive' } }
    );
    if (result.modifiedCount && result.modifiedCount > 0) {
      console.log(`Marked ${result.modifiedCount} properties as inactive (older than 30 days)`);
    }
  } catch (err) {
    console.error('Error running markExpiredProperties job:', err);
  }
};

// Run at startup and then once every 24 hours
markExpiredProperties();
setInterval(markExpiredProperties, 24 * MS_PER_DAY);

export default app;