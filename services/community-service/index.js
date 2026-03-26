import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db.js';
import communityRoutes from './routes/communityRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

// Security Headers
app.use(helmet());

// CORS
app.use(cors());

// Logging
app.use(morgan('dev'));

// Body parsing
app.use(express.json());

// Routes
app.use('/api/communities', communityRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Community Service is healthy' });
});

// Connect DB and Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Community Service running on port ${PORT}`);
  });
});

export default app;
