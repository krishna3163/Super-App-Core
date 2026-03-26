import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import cookieParser from 'cookie-parser';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import chatRoutes from './routes/chatRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import { handleErrors } from './utils/errors.js';
import correlationMiddleware from './utils/correlationMiddleware.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5003;

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || true,
  credentials: true
}));

app.use(correlationMiddleware);
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000, // Chat needs higher limit than auth
  message: { status: 'fail', message: 'Too many requests, please try again later' }
});
app.use(limiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());
app.use(mongoSanitize());
app.use(hpp());

app.use('/chats', chatRoutes);
app.use('/messages', messageRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Chat Service is healthy', correlationId: req.correlationId });
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
    console.log(`🚀 Chat Service running on port ${PORT}`);
  });

  const io = new Server(server, {
    pingTimeout: 60000,
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log('connected to socket.io');

    socket.on('setup', (userData) => {
      socket.join(userData.id);
      socket.emit('connected');
    });

    socket.on('join chat', (room) => {
      socket.join(room);
      console.log('User Joined Room: ' + room);
    });

    socket.on('typing', (room) => socket.in(room).emit('typing'));
    socket.on('stop typing', (room) => socket.in(room).emit('stop typing'));

    socket.on('new message', (newMessageReceived) => {
      let chat = newMessageReceived.chat;
      if (!chat.users) return console.log('chat.users not defined');

      chat.users.forEach((user) => {
        if (user === newMessageReceived.sender) return;
        socket.in(user).emit('message received', newMessageReceived);
      });
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
