import express from 'express';
import * as posController from '../controllers/posController.js';

const router = express.Router();

router.post('/qr/generate', posController.generateQrCode);
router.post('/qr/pay', posController.payPosQr);

export default router;
