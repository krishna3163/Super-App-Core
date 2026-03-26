import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
import connectDB from './config/db.js';
import foodRoutes from './routes/foodRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5020;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/', foodRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Advanced Food Service is running' });
});

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Advanced Food Service running on port ${PORT}`);
  });

  const io = new Server(server, {
    pingTimeout: 60000,
    cors: { origin: '*' },
  });

  io.on('connection', (socket) => {
    console.log('connected to food/delivery socket');

    // Partner joins room to receive orders
    socket.on('partner_online', (partnerId) => {
      socket.join(`partner_${partnerId}`);
    });

    // User joins room to track order
    socket.on('track_order', (orderId) => {
      socket.join(`order_${orderId}`);
    });

    // Update location event
    socket.on('update_delivery_location', (data) => {
      const { partnerId, orderId, location } = data;
      io.in(`order_${orderId}`).emit('delivery_location_update', location);
    });

    socket.on('disconnect', () => {
      console.log('USER DISCONNECTED FROM FOOD SERVICE');
    });
  });
});
