import express from 'express';
import * as paymentController from '../controllers/paymentController.js';

const router = express.Router();

router.post('/profile', paymentController.createProfile);
router.get('/profile/:userId', paymentController.getProfile);
router.get('/profile', paymentController.getProfile); // For getting self profile via headers
router.post('/transfer', paymentController.initiateTransfer);
router.post('/topup', paymentController.addMoney);
router.get('/transactions/:userId', paymentController.getTransactions);
router.get('/transactions', paymentController.getTransactions); // For self via headers

export default router;
