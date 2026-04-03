import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import discordRoutes from './routes/discordRoutes.js';

import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5016;

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

app.use('/', discordRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Discord Service is running' });
});

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Discord Service running on port ${PORT}`);
  });

  const io = new Server(server, {
    pingTimeout: 60000,
    cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true },
  });

  io.on('connection', (socket) => {
    console.log('connected to discord socket');

    // Room Management
    socket.on('join_channel', (channelId) => {
      socket.join(channelId);
      console.log('User Joined Discord Channel: ' + channelId);
    });

    // Real-time Messaging
    socket.on('new_discord_message', (message) => {
      socket.in(message.channelId).emit('message_received', message);
    });

    // WebRTC Signaling for Voice Channels
    socket.on('voice_join', (data) => {
      const { channelId, userId } = data;
      socket.join(`voice_${channelId}`);
      socket.to(`voice_${channelId}`).emit('user_joined_voice', { userId, socketId: socket.id });
    });

    socket.on('offer', (data) => {
      const { target, offer, userId } = data;
      io.to(target).emit('offer', { offer, userId, socketId: socket.id });
    });

    socket.on('answer', (data) => {
      const { target, answer, userId } = data;
      io.to(target).emit('answer', { answer, userId, socketId: socket.id });
    });

    socket.on('ice_candidate', (data) => {
      const { target, candidate, userId } = data;
      io.to(target).emit('ice_candidate', { candidate, userId, socketId: socket.id });
    });

    socket.on('disconnect', () => {
      console.log('USER DISCONNECTED FROM DISCORD');
    });
  });
});
