import dns from 'dns';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

// Prioritize IPv4 DNS resolution to prevent ENETUNREACH on Render Linux containers
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());

// Express 5 compatible Mongo Sanitization (prevents NoSQL injection while respecting req.query getter)
app.use((req: Request, res: Response, next: NextFunction) => {
  ['body', 'params', 'headers'].forEach((key) => {
    if ((req as any)[key]) {
      (req as any)[key] = mongoSanitize.sanitize((req as any)[key]);
    }
  });
  if (req.query) {
    Object.keys(req.query).forEach((key) => {
      if (typeof req.query[key] === 'object' && req.query[key] !== null) {
        req.query[key] = mongoSanitize.sanitize(req.query[key]);
      }
    });
  }
  next();
});

// CORS Configuration (Permit mobile native app requests where Origin header is omitted)
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5000', 'http://10.0.2.2:5000'];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (
        process.env.NODE_ENV !== 'production' ||
        allowedOrigins.length === 0 ||
        allowedOrigins.includes(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error('Blocked by CORS policy'));
    },
    credentials: true,
  })
);

// MongoDB Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/giet_events';
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('[Database] Connected to MongoDB successfully');
  })
  .catch((err) => {
    console.error('[Database] MongoDB connection failure:', err.message);
  });

// Production Security Environment Check
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    console.error('[Security Warning] JWT_SECRET is not configured in environment!');
  }
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.warn('[Email Warning] Production SMTP credentials not configured. OTP delivery will fail in production.');
  }
}

// Body Parser with generous limit to accommodate high-res event posters
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Health Check Endpoint
// (Lightweight, unauthenticated, exempt from rate-limiting for UptimeRobot & cloud keep-alive monitors)
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Too many requests from this IP, please try again after 15 minutes' } }
});
app.use('/api', globalLimiter);

// Routes
import authRoutes from './routes/authRoutes';
import profileRoutes from './routes/profileRoutes';
import eventRoutes from './routes/eventRoutes';
import registrationRoutes from './routes/registrationRoutes';
import adminEventRoutes from './routes/adminEventRoutes';
import notificationRoutes from './routes/notificationRoutes';
import systemRoutes from './routes/systemRoutes';

import eventLandingRoutes from './routes/eventLandingRoutes';

app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/events', eventRoutes);
app.use('/api', registrationRoutes);
app.use('/api/admin', adminEventRoutes);
app.use('/api/admin/events', adminEventRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/system', systemRoutes);

// Smart Universal Event Registration Landing Pages (For QR code scanning via camera/browser)
app.use('/e', eventLandingRoutes);
app.use('/events', eventLandingRoutes);

// Direct APK Download Redirect
app.get('/download/app', (req: Request, res: Response) => {
  const apkDownloadUrl = process.env.APK_DOWNLOAD_URL || 'https://github.com/KAditya2006/EventManagerForCollege/raw/main/gieta-event-manager.apk';
  res.redirect(apkDownloadUrl);
});

// Global Error Handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('[Global Error]', err.stack || err);
  const isProduction = process.env.NODE_ENV === 'production';
  res.status(err.status || 500).json({
    success: false,
    error: {
      message: isProduction ? 'Internal Server Error' : err.message || 'Internal Server Error'
    }
  });
});

// Graceful Shutdown for container orchestrators (Render / Linux signals)
const gracefulShutdown = async (signal: string) => {
  console.log(`[Server] ${signal} signal received. Closing database and shutting down...`);
  try {
    await mongoose.connection.close(false);
    console.log('[Server] Database connection closed cleanly.');
    process.exit(0);
  } catch (err) {
    console.error('[Server] Error during graceful shutdown:', err);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start Server (Guarded for automated testing)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

export default app;
export { app };
