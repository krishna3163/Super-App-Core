import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import socialRoutes from './routes/socialRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5017;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/', socialRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Facebook Advanced Social Service is running' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Facebook Social Service running on port ${PORT}`);
  });
});
