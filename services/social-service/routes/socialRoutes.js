import express from 'express';
import postController from '../controllers/postController.js';
import storyController from '../controllers/storyController.js';

const router = express.Router();

// Posts
router.post('/posts', postController.createPost);
router.post('/posts/like', postController.likePost);
router.post('/posts/vote-post', postController.votePost); // Reddit voting
router.post('/posts/award', postController.awardPost); // Reddit awards
router.post('/posts/interest', postController.toggleInterest);
router.post('/posts/vote', postController.votePoll);
router.post('/posts/comment', postController.addComment);
router.post('/posts/comment/vote', postController.voteComment); // Reddit comment voting
router.get('/posts/:postId/comments', postController.getComments);
router.get('/posts/user/:userId', postController.getUserPosts);
router.post('/posts/repost', postController.repostPost);
router.post('/posts/share', postController.sharePost);
router.post('/posts/report', postController.reportPost);
router.get('/posts/:postId/reports', postController.getPostReports);
router.post('/posts/delete', postController.deletePost);
router.get('/search/hashtag', postController.searchHashtag);
router.get('/search/mentions', postController.searchMentions);
router.post('/feed', postController.getFeed);
router.get('/explore', postController.getExplore);
router.get('/reels', postController.getReels);

// Stories
router.post('/stories', storyController.createStory);
router.post('/stories/view', storyController.viewStory);
router.post('/stories/feed', storyController.getStories);

export default router;
