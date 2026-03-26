import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import foodRoutes from './routes/foodRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5010;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/', foodRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Food Service is running' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Food Service running on port ${PORT}`);
  });
});
