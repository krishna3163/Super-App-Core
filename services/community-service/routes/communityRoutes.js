import express from 'express';
import * as communityController from '../controllers/communityController.js';

const router = express.Router();

router.post('/', communityController.createCommunity);
router.get('/', communityController.listCommunities);
router.post('/:communityId/join', communityController.joinCommunity);
router.post('/posts', communityController.createPost);
router.get('/:communityId/posts', communityController.getCommunityPosts);

export default router;
