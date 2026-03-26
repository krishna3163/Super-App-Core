import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import { handleErrors } from './utils/errors.js';
import correlationMiddleware from './utils/correlationMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Trust first proxy for rate limiting (if behind one)
app.set('trust proxy', 1);

// Security Headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true
}));

// Request Tracking
app.use(correlationMiddleware);

// Logging
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Data Sanitization
app.use(mongoSanitize());
app.use(hpp());

// Log incoming requests (refined)
app.use((req, res, next) => {
  console.log(`[Auth Service] [${req.correlationId}] ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/', authRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Auth Service is healthy', correlationId: req.correlationId });
});

// Error Handling
app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  next(err);
});

app.use(handleErrors);

// Connect DB and Start Server
if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Auth Service running on port ${PORT}`);
    });
  });
}

export default app;
