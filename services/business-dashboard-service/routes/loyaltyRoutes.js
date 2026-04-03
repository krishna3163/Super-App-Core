import express from 'express';
import * as loyaltyController from '../controllers/loyaltyController.js';

const router = express.Router();

router.post('/setup', loyaltyController.setupLoyaltyProgram);
router.post('/points/add', loyaltyController.addPointsToCustomer);

export default router;
