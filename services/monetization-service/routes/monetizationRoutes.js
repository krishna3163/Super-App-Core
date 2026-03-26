import express from 'express';
import walletController from '../controllers/walletController.js';

const router = express.Router();

router.get('/wallet/:userId', walletController.getWallet);
router.post('/wallet/add-funds', walletController.addFunds);
router.post('/wallet/buy-coins', walletController.buyCoins);
router.post('/wallet/tip', walletController.sendTip);

export default router;
