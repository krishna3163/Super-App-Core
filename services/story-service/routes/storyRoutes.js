import express from 'express';
import { createStory, getFeed, viewStory, getViewers, reactToStory, replyToStory, deleteStory, getMyStories, createHighlight, getUserHighlights, addToHighlight, deleteHighlight } from '../controllers/storyController.js';

const router = express.Router();

// Stories
router.post('/', createStory);
router.post('/feed', getFeed);
router.post('/:storyId/view', viewStory);
router.get('/:storyId/viewers', getViewers);
router.post('/:storyId/react', reactToStory);
router.post('/:storyId/reply', replyToStory);
router.delete('/:storyId', deleteStory);
router.get('/user/:userId', getMyStories);

// Highlights
router.post('/highlights', createHighlight);
router.get('/highlights/:userId', getUserHighlights);
router.post('/highlights/:highlightId/add', addToHighlight);
router.delete('/highlights/:highlightId', deleteHighlight);

export default router;
