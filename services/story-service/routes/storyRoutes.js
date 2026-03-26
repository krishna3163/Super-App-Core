import express from 'express';
import * as storyController from '../controllers/storyController.js';

const router = express.Router();

router.post('/', storyController.createStory);
router.post('/feed', storyController.getFeed);
router.post('/:storyId/view', storyController.viewStory);

export default router;
