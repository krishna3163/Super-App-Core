import express from 'express';
import foodController from '../controllers/foodController.js';
import deliveryController from '../controllers/deliveryController.js';

const router = express.Router();

// User / Ordering
router.post('/orders', foodController.placeOrder);
router.patch('/orders/status', foodController.updateOrderStatus);
router.get('/orders/track/:orderId', foodController.getOrderTracking);

// Delivery Partner
router.post('/delivery/status', deliveryController.updatePartnerStatus);
router.post('/delivery/accept', deliveryController.acceptOrder);
router.post('/delivery/complete/:orderId', deliveryController.completeDelivery);

export default router;
