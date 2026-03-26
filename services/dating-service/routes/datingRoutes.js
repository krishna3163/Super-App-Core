import express from 'express';
import * as datingController from '../controllers/datingController.js';

const router = express.Router();

router.get('/profile/:userId', datingController.getProfile);
router.post('/profile', datingController.updateProfile);
router.post('/swipe', datingController.swipe);
router.get('/matches/:userId', datingController.getMatches);
router.get('/random', datingController.getRandomProfiles);

export default router;
