import express from 'express';
import * as paymentController from '../controllers/paymentController.js';

const router = express.Router();

router.post('/initiate', paymentController.initiatePayment);
router.patch('/confirm', paymentController.confirmPayment);

export default router;
