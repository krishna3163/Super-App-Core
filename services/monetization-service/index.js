import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import monetizationRoutes from './routes/monetizationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5026;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/', monetizationRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Monetization Service is running' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Monetization Service running on port ${PORT}`);
  });
});
