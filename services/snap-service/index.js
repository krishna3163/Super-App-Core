import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import connectDB from './config/db.js';
import snapRoutes from './routes/snapRoutes.js';
import { handleErrors } from './utils/errors.js';
import correlationMiddleware from './utils/correlationMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5031;

app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(correlationMiddleware);
app.use(morgan('dev'));

// Rate limiting for sending snaps
const sendLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // 30 snaps per minute
  message: { status: 'fail', message: 'Too many snaps sent, slow down!' }
});
app.use('/send', sendLimiter);

app.use(express.json({ limit: '10kb' }));
app.use(mongoSanitize());
app.use(hpp());

import mapRoutes from './routes/mapRoutes.js';

app.use('/', snapRoutes);
app.use('/map', mapRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Snap Service is healthy', correlationId: req.correlationId });
});

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
      console.log(`🚀 Snap Service running on port ${PORT}`);
    });
  });
}

export default app;
