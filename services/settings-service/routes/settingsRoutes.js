import express from 'express';
import settingsController from '../controllers/settingsController.js';
import adminController from '../controllers/adminController.js';

const router = express.Router();

// User Settings
router.get('/:userId', settingsController.getSettings);
router.patch('/:userId/:section', settingsController.updateSection);
router.post('/:userId/privacy/block', settingsController.blockUser);
router.post('/:userId/security/logout-all', settingsController.clearSessions);

// Global Admin Config
router.get('/admin/config', adminController.getConfig);
router.patch('/admin/config', adminController.updateConfig);

export default router;
