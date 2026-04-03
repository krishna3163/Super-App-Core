import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import communityRoutes from './routes/communityRoutes.js';

import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

// Security Headers
app.use(helmet());

// CORS
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

// Logging
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Body parsing
app.use(express.json());
app.use(mongoSanitize());
app.use(hpp());

// Routes
app.use('/api/communities', communityRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Community Service is healthy' });
});

// Connect DB and Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Community Service running on port ${PORT}`);
  });
});

export default app;
