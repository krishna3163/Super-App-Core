import express from 'express';
import * as datingController from '../controllers/datingController.js';

const router = express.Router();

router.get('/profile/:userId', datingController.getProfile);
router.post('/profile', datingController.updateProfile);
router.post('/swipe', datingController.swipe);
router.post('/rewind', datingController.rewindSwipe);
router.post('/boost', datingController.boostProfile);
router.post('/blind-date/join', datingController.joinBlindDateQueue);
router.post('/blind-date/reveal', datingController.revealIdentity);
router.get('/matches/:userId', datingController.getMatches);
router.get('/random', datingController.getRandomProfiles);

export default router;
