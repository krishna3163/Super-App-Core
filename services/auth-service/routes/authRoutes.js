import express from 'express';
import authController from '../controllers/authController.js';
import { authenticateToken } from '../utils/authMiddleware.js';

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);

// 2FA Routes
router.post('/2fa/setup', authenticateToken, authController.setup2FA);
router.post('/2fa/verify', authenticateToken, authController.verify2FA);
router.post('/2fa/disable', authenticateToken, authController.disable2FA);
router.post('/2fa/login-verify', authController.loginVerify2FA);
router.get('/2fa/status', authenticateToken, authController.status2FA);

export default router;
