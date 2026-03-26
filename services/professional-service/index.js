import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import professionalRoutes from './routes/professionalRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5006;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/', professionalRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Professional Service is running' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Professional Service running on port ${PORT}`);
  });
});
