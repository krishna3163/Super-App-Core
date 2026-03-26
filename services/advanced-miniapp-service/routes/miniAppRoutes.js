import express from 'express';
import miniAppController from '../controllers/miniAppController.js';

const router = express.Router();

router.post('/register', miniAppController.registerApp);
router.get('/all', miniAppController.getAllApps);
router.post('/pin', miniAppController.pinApp);
router.get('/pinned/:userId', miniAppController.getPinnedApps);
router.post('/launch', miniAppController.launchApp);

export default router;
