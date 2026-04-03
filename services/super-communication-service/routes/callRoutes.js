import express from 'express';
import * as callController from '../controllers/callController.js';

const router = express.Router();

router.post('/start', callController.startCall);
router.post('/end', callController.endCall);
router.get('/history/:userId', callController.getCallHistory);

export default router;
