import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import groupChatRoutes from './routes/groupChatRoutes.js';
import { handleErrors } from './utils/errors.js';
import correlationMiddleware from './utils/correlationMiddleware.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5004;

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));

app.use(correlationMiddleware);
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { status: 'fail', message: 'Too many requests' }
});
app.use(limiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());

import expenseRoutes from './routes/expenseRoutes.js';

app.use('/groups', groupChatRoutes);
app.use('/expenses', expenseRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Group Chat Service is healthy', correlationId: req.correlationId });
});

app.all('*', (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on this server!`);
  err.statusCode = 404;
  next(err);
});

app.use(handleErrors);

const startServer = async () => {
  await connectDB();
  const server = app.listen(PORT, () => {
    console.log(`🚀 Group Chat Service running on port ${PORT}`);
  });

  const io = new Server(server, {
    pingTimeout: 60000,
    cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true },
  });

  io.on('connection', (socket) => {
    console.log('connected to socket.io');

    socket.on('setup', (userData) => {
      socket.join(userData.id);
      socket.emit('connected');
    });

    socket.on('join group', (groupId) => {
      socket.join(groupId);
      console.log('User Joined Group: ' + groupId);
    });

    socket.on('typing', (groupId) => socket.in(groupId).emit('typing'));
    socket.on('stop typing', (groupId) => socket.in(groupId).emit('stop typing'));

    socket.on('new group message', (newMessageReceived) => {
      const { groupId } = newMessageReceived;
      if (!groupId) return console.log('groupId not defined');
      socket.in(groupId).emit('group message received', newMessageReceived);
    });

    socket.on('disconnect', () => {
      console.log('USER DISCONNECTED');
    });
  });
};

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
