import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import rideRoutes from './routes/rideRoutes.js';

import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5019;

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

app.use('/', rideRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Advanced Ride Service is running' });
});

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Advanced Ride Service running on port ${PORT}`);
  });

  const io = new Server(server, {
    pingTimeout: 60000,
    cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true },
  });

  io.on('connection', (socket) => {
    console.log('connected to ride socket');

    socket.on('update_location', (data) => {
      const { driverId, location } = data;
      socket.broadcast.emit('driver_location_update', { driverId, location });
    });

    socket.on('ride_request', (rideData) => {
      socket.broadcast.emit('new_ride_request', rideData);
    });

    socket.on('disconnect', () => {
      console.log('USER DISCONNECTED FROM RIDE SERVICE');
    });
  });
});
