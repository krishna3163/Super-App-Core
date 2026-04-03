import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dashboardRoutes from './routes/dashboardRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5024;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/', dashboardRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Dashboard Service is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Dashboard Service running on port ${PORT}`);
});
