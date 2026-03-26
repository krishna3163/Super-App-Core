import express from 'express';
import * as safetyController from '../controllers/safetyController.js';

const router = express.Router();

router.post('/block', safetyController.blockUser);
router.post('/report', safetyController.reportUser);
router.get('/blocks/:userId', safetyController.getBlockedUsers);

export default router;
