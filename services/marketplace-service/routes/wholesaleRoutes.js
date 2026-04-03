import express from 'express';
import * as wholesaleController from '../controllers/wholesaleController.js';

const router = express.Router();

router.post('/products', wholesaleController.createWholesaleListing);
router.post('/negotiate', wholesaleController.negotiateBulkOrder);

export default router;
