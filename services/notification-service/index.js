import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import admin from 'firebase-admin';
import connectDB from './config/db.js';
import notificationRoutes from './routes/notificationRoutes.js';

import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5013;

// Initialize Firebase Admin using environment variables
// Required env vars: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY_ID,
//                    FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

try {
  if (serviceAccount.project_id && serviceAccount.private_key && serviceAccount.client_email) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Firebase Admin Initialized');
  } else {
    console.warn('⚠️  Firebase Admin not initialized: missing FIREBASE_* environment variables');
  }
} catch (error) {
  console.error('❌ Firebase Admin Init Error:', error.message);
}

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many requests, please try again later.' },
});
app.use(limiter);
app.use(express.json());
app.use(mongoSanitize());
app.use(hpp());

app.use('/notify', notificationRoutes);
app.use('/', notificationRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Notification Service is running' });
});

app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  next(err);
});

// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'error',
    message: err.message
  });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Notification Service running on port ${PORT}`);
  });
});
