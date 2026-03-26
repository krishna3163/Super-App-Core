import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';

import roleRoutes from './routes/roleRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5030;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.use('/roles', roleRoutes);
app.use('/services', serviceRoutes);
app.use('/payments', paymentRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Economy Service is running' });
});

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Economy Service running on port ${PORT}`);
  });
});
