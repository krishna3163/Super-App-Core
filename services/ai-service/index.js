import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5033;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

import filterRoutes from './routes/filterRoutes.js';

app.use('/', aiRoutes);
app.use('/filters', filterRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'AI Service is running' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 AI Service running on port ${PORT}`);
  });
});
