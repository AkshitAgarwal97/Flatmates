import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from 'passport';
import path from 'path';
import http from 'http';
import { Server as SocketIo } from 'socket.io';
import fs from 'fs';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import propertyRoutes from './routes/properties';
import messageRoutes from './routes/messages';

// Import passport config
import configurePassport from './config/passport';

// Import socket service
import socketHandler from './services/socket';
// Import Property model for background jobs
import Property from './models/Property';

// Initialize express app
const app = express();
const server = http.createServer(app);
const io = new SocketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
});

// Ensure upload directories exist
const uploadsDir = path.join(process.cwd(), 'uploads');
const avatarsDir = path.join(uploadsDir, 'avatars');
const propertiesDir = path.join(uploadsDir, 'properties');
try {
  fs.mkdirSync(avatarsDir, { recursive: true });
  fs.mkdirSync(propertiesDir, { recursive: true });
} catch (e) {
  console.error('Failed to create upload directories:', e);
}

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", process.env.CLIENT_URL || 'http://localhost:3000'],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://picsum.photos", "blob:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
    },
  },
}));
app.use(mongoSanitize());

// Trust proxy for rate limiting (fixes X-Forwarded-For warning)
app.set('trust proxy', 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api', limiter);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use('/', express.static(__dirname + '/public'))

// Serve uploaded files statically
app.use('/uploads', express.static(uploadsDir));

// Configure and initialize passport
configurePassport(passport);
app.use(passport.initialize());

// Socket.io connection
socketHandler(io);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/messages', messageRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
  });
}

// Connect to MongoDB
const mongoURI = process.env.MONGO_URI || process.env.MONGO_URL || process.env.DATABASE_URL || 'mongodb://localhost:27017/flatmates';

console.log(`Attempting to connect to MongoDB... (URI length: ${mongoURI.length})`);

mongoose
  .connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    if (process.env.NODE_ENV === 'production') {
      console.error('Critical: Could not connect to database in production.');
    }
  });

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