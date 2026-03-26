import express from 'express';
import * as feedController from '../controllers/unifiedFeedController.js';

const router = express.Router();

router.post('/posts', feedController.createPost);
router.get('/feed', feedController.getUnifiedFeed);
router.post('/interact', feedController.interactWithPost);

export default router;
