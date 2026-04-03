import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dashboardRoutes from './routes/dashboardRoutes.js';

import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5024;

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

app.use('/', dashboardRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Dashboard Service is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Dashboard Service running on port ${PORT}`);
});
