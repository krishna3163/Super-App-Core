import express from 'express';
import aggregatorController from '../controllers/aggregatorController.js';

const router = express.Router();

router.get('/profile/:userId', aggregatorController.getUnifiedProfile);
router.get('/search', aggregatorController.globalSearch);
router.post('/home', aggregatorController.getHomeDashboard);

export default router;
