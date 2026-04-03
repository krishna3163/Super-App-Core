import express from 'express';
import controller from '../controllers/advancedDatingController.js';

const router = express.Router();

// Profile
router.post('/profile', controller.updateProfile);
router.get('/profile/:userId', controller.getProfile);

// Swiping
router.post('/swipe', controller.swipe);
router.post('/rewind', controller.rewindSwipe);
router.post('/boost', controller.boostProfile);

// Feed & Matches
router.get('/feed/:userId', controller.getFeed);
router.get('/matches/:userId', controller.getMatches);
router.get('/liked-me/:userId', controller.getLikedMe);
router.post('/unmatch', controller.unmatch);

// Safety & Scheduling
router.post('/report', controller.reportUser);
router.post('/schedule-date', controller.scheduleDateSpot);

export default router;
