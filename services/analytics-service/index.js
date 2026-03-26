import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5037;

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Analytics Service is active' });
});

app.post('/track', (req, res) => {
    console.log('[Analytics]', req.body);
    res.status(200).json({ success: true });
});

app.listen(PORT, () => {
  console.log(`🚀 Analytics Service running on port ${PORT}`);
});
