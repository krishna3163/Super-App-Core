import express from 'express';
import * as engagementController from '../controllers/engagementController.js';

const router = express.Router();

// Polls
router.post('/poll', engagementController.createPoll);
router.post('/poll/vote', engagementController.votePoll);

// Events, Alerts, Notices
router.post('/create', engagementController.createEngagement);
router.get('/:targetId', engagementController.getEngagements);

export default router;
