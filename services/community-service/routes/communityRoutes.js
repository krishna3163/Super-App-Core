import express from 'express';
import { createCommunity, joinCommunity, leaveCommunity, createPost, getCommunityPosts, votePost, votePoll, listCommunities, getCommunityDetails, getUserCommunities, removePost, banUser, reportPost, pinPost } from '../controllers/communityController.js';
import { addComment, getComments, voteComment, deleteComment, editComment } from '../controllers/commentController.js';

const router = express.Router();

// Communities
router.post('/', createCommunity);
router.get('/', listCommunities);
router.get('/user/:userId', getUserCommunities);
router.get('/:communityId', getCommunityDetails);
router.post('/:communityId/join', joinCommunity);
router.post('/:communityId/leave', leaveCommunity);

// Posts
router.post('/posts', createPost);
router.get('/:communityId/posts', getCommunityPosts);
router.post('/posts/:postId/vote', votePost);
router.post('/posts/:postId/poll/vote', votePoll);
router.post('/posts/:postId/report', reportPost);
router.post('/posts/:postId/pin', pinPost);

// Comments
router.post('/comments', addComment);
router.get('/comments/:postId', getComments);
router.post('/comments/:commentId/vote', voteComment);
router.put('/comments/:commentId', editComment);
router.delete('/comments/:commentId', deleteComment);

// Moderation
router.delete('/mod/posts/:postId', removePost);
router.post('/mod/:communityId/ban', banUser);

export default router;
