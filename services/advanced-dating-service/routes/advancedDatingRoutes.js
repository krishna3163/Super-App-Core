import express from 'express';
import advancedDatingController from '../controllers/advancedDatingController.js';

const router = express.Router();

router.post('/profile', advancedDatingController.updateProfile);
router.post('/swipe', advancedDatingController.swipe);
router.post('/rewind', advancedDatingController.rewindSwipe);
router.post('/boost', advancedDatingController.boostProfile);
router.get('/feed/:userId', advancedDatingController.getFeed);

export default router;
