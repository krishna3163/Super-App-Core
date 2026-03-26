import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import searchRoutes from './routes/searchRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5025;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/', searchRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Global Search Service is running' });
});

app.listen(PORT, () => {
  console.log(`🚀 Global Search Service running on port ${PORT}`);
});
