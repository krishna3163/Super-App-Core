import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import connectDB from './config/db.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5033;

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));

// General rate limit: 200 requests per 15 minutes per IP
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use(generalLimiter);

// Strict AI endpoint rate limit: max 20 requests per minute per IP
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI rate limit exceeded. Please wait before making more requests.' },
});
app.use('/ask', aiLimiter);
app.use('/summarize', aiLimiter);
app.use('/reply', aiLimiter);
app.use('/recommend', aiLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(hpp());

import filterRoutes from './routes/filterRoutes.js';

app.use('/', aiRoutes);
app.use('/filters', filterRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'AI Service is running' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 AI Service running on port ${PORT}`);
  });
});
