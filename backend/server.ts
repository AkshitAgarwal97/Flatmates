import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import path from 'path';
import http from 'http';
import { Server as SocketIo } from 'socket.io';
import fs from 'fs';
import dotenv from 'dotenv';

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

// Initialize express app
const app = express();
const server = http.createServer(app);
// Allowed origins: custom domain, Vercel deployment, localhost
const allowedOrigins = [
  'https://flatmates.co.in',
  'https://www.flatmates.co.in',
  'https://frontend-ecru-nine-30.vercel.app',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
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
const uploadsDir = path.join(__dirname, 'uploads');
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
app.use('/', express.static(__dirname + '/public'))

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Configure and initialize passport
configurePassport(passport);
app.use(passport.initialize());

// Socket.io connection
socketHandler(io);

// Activity tracking middleware
app.use(async (req, res, next) => {
  if (req.user) {
    try {
      const User = require('./models/User').default;
      await User.findByIdAndUpdate((req.user as any).id, { lastActive: new Date() });
    } catch (err) {
      console.error('Failed to update lastActive:', err);
    }
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/messages', messageRoutes);
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

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

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