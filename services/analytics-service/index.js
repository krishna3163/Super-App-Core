import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5037;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '5mb' })); // larger limit for batch events

app.use('/', analyticsRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Analytics Service is running' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Analytics Service running on port ${PORT}`);
  });
});
