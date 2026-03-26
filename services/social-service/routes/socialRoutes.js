import express from 'express';
import postController from '../controllers/postController.js';
import storyController from '../controllers/storyController.js';

const router = express.Router();

// Posts
router.post('/posts', postController.createPost);
router.post('/posts/like', postController.likePost);
router.post('/posts/interest', postController.toggleInterest);
router.post('/posts/vote', postController.votePoll);
router.post('/posts/comment', postController.addComment);
router.get('/posts/:postId/comments', postController.getComments);
router.get('/posts/user/:userId', postController.getUserPosts);
router.post('/feed', postController.getFeed);
router.get('/explore', postController.getExplore);
router.get('/reels', postController.getReels);

// Stories
router.post('/stories', storyController.createStory);
router.post('/stories/view', storyController.viewStory);
router.post('/stories/feed', storyController.getStories);

export default router;
