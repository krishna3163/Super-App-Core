import express from 'express';
import * as privacyController from '../controllers/privacyController.js';

const router = express.Router();

router.get('/:userId', privacyController.getPrivacySettings);
router.patch('/:userId', privacyController.updatePrivacySettings);

export default router;
