import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import aggregatorRoutes from './routes/aggregatorRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5015;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/', aggregatorRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Aggregator Service is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Aggregator Service running on port ${PORT}`);
});
