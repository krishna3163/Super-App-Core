import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import miniAppRoutes from './routes/miniAppRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5023;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/', miniAppRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Advanced Mini App Service is running' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Advanced Mini App Service running on port ${PORT}`);
  });
});
