import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import datingRoutes from './routes/datingRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5007;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/dating', datingRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Dating Service is healthy' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Dating Service running on port ${PORT}`);
  });
});

export default app;
