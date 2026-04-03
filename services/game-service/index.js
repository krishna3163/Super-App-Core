import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import Room from './models/Room.js';
import gameRoutes from './routes/gameRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5012;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/', gameRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Game Service is running' });
});

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Game Service running on port ${PORT}`);
  });

  const io = new Server(server, {
    pingTimeout: 60000,
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log('connected to socket.io (game)');

    socket.on('join_room', (roomCode) => {
      socket.join(roomCode);
      console.log('User Joined Game Room: ' + roomCode);
    });

    socket.on('draw', (data) => {
      const { roomCode, stroke } = data;
      socket.in(roomCode).emit('draw_receive', stroke);
    });

    socket.on('guess', async (data) => {
      const { roomCode, userId, guess } = data;
      const room = await Room.findOne({ roomCode });
      
      if (room && room.currentWord && guess.toLowerCase() === room.currentWord.toLowerCase()) {
        const player = room.players.find(p => p.userId === userId);
        if (player) {
          player.score += 10;
          await room.save();
          io.in(roomCode).emit('correct_guess', { userId, score: player.score });
        }
      } else {
        io.in(roomCode).emit('guess_receive', { userId, guess });
      }
    });

    socket.on('start_game', async (roomCode) => {
      const room = await Room.findOne({ roomCode });
      if (room) {
        room.status = 'playing';
        room.currentWord = 'apple'; // Example word, should be random in real app
        room.players[0].isDrawing = true;
        await room.save();
        io.in(roomCode).emit('game_started', { drawerId: room.players[0].userId });
      }
    });

    socket.on('clear_canvas', (roomCode) => {
      socket.in(roomCode).emit('clear_receive');
    });

    socket.on('disconnect', () => {
      console.log('USER DISCONNECTED FROM GAME');
    });
  });
});
