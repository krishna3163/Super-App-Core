import express from 'express';
import controller from '../controllers/walletController.js';

const router = express.Router();

// Wallet
router.get('/wallet/:userId', controller.getWallet);
router.post('/wallet/add-funds', controller.addFunds);
router.post('/wallet/buy-coins', controller.buyCoins);
router.post('/wallet/tip', controller.sendTip);
router.get('/wallet/:userId/transactions', controller.getTransactions);

// Creator profiles
router.post('/creators', controller.upsertCreatorProfile);
router.get('/creators/top', controller.getTopCreators);
router.get('/creators/:userId', controller.getCreatorProfile);
router.get('/creators/:userId/earnings', controller.getCreatorEarnings);

// Subscriptions
router.post('/subscriptions', controller.subscribe);
router.delete('/subscriptions/:subId', controller.cancelSubscription);
router.get('/subscriptions/user/:userId', controller.getMySubscriptions);
router.get('/subscriptions/creator/:creatorId', controller.getCreatorSubscribers);

export default router;
