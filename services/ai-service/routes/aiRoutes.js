import express from 'express';
import * as aiController from '../controllers/aiController.js';

const router = express.Router();

router.post('/summarize', aiController.summarizeChat);
router.post('/reply', aiController.suggestReplies);
router.post('/ask', aiController.askAI);
router.post('/recommend', aiController.getRecommendations);

export default router;
