import express from 'express';
import * as shippingController from '../controllers/shippingController.js';

const router = express.Router();

router.post('/create', shippingController.createShippingRecord);
router.post('/live-update', shippingController.updateLiveLocation);
router.get('/track/:trackingNumber', shippingController.trackShipment);

export default router;
