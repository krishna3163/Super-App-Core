import express from 'express';
import userController from '../controllers/userController.js';

const router = express.Router();

router.get('/profile/list', userController.listProfiles);
router.get('/profile/:id', userController.getProfile);
router.post('/profile', userController.updateProfile);
router.get('/settings', userController.getSettings);
router.put('/settings', userController.updateSettings);
router.post('/follow', userController.followUser);
router.post('/block', userController.blockUser);

// KYC Routes
router.post('/kyc/submit', userController.submitKYC);
router.get('/kyc/status', userController.getKYCStatus);
router.patch('/kyc/verify', userController.verifyKYC);

export default router;
