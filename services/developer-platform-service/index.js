import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import connectDB from './config/db.js';
import developerRoutes from './routes/developerRoutes.js';

import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5038;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(mongoSanitize());
app.use(hpp());

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Stricter limit for SDK event ingestion (write-heavy endpoint)
const sdkEventsLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 200,
  message: { error: 'SDK event rate limit exceeded.' },
});
app.use('/sdk/events', sdkEventsLimiter);

app.use('/', developerRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Developer Platform Service is running' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Developer Platform Service running on port ${PORT}`);
  });
});
