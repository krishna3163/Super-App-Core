import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
import connectDB from './config/db.js';

import randomChatRoutes from './routes/randomChatRoutes.js';
import safetyRoutes from './routes/safetyRoutes.js';
import profileControlRoutes from './routes/profileControlRoutes.js';
import gameRoutes from './routes/gameRoutes.js';

import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5029;

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

// Routes
app.use('/random', randomChatRoutes);
app.use('/user', safetyRoutes);
app.use('/profile-control', profileControlRoutes);
app.use('/games', gameRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Advanced Interactions Service is running' });
});

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Advanced Interactions Service running on port ${PORT}`);
  });

  const io = new Server(server, {
    pingTimeout: 60000,
    cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true },
  });

  io.on('connection', (socket) => {
    console.log('connected to advanced interactions socket');

    // Phase A1 & A7: Anonymous Chat Realtime
    socket.on('join_anonymous_session', (sessionId) => {
      socket.join(sessionId);
      io.to(sessionId).emit('user_matched', { message: 'Connected to a stranger' });
      io.to(sessionId).emit('timer_started', { duration: 60 });
    });

    socket.on('anonymous_message', (data) => {
      const { sessionId, message, senderTempName } = data;
      socket.to(sessionId).emit('message_received', { message, senderTempName });
    });

    socket.on('leave_anonymous_session', (sessionId) => {
      socket.to(sessionId).emit('stranger_disconnected');
      socket.leave(sessionId);
    });

    // Phase A6 & A7: Game Realtime System
    socket.on('join_game', (gameId) => {
      socket.join(`game_${gameId}`);
    });

    socket.on('game_action', (data) => {
      // Broadcast game state updates to all players in the game room
      const { gameId, action, payload } = data;
      io.to(`game_${gameId}`).emit('game_update', { action, payload });
    });

    socket.on('draw_stroke', (data) => {
      const { gameId, strokeData } = data;
      socket.to(`game_${gameId}`).emit('draw_update', strokeData);
    });

    socket.on('disconnect', () => {
      console.log('USER DISCONNECTED FROM ADVANCED INTERACTIONS');
    });
  });
});
