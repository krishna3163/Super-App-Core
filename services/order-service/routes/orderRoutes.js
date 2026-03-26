import express from 'express';
import orderController from '../controllers/orderController.js';

const router = express.Router();

router.post('/place', orderController.placeOrder);
router.get('/:id', orderController.getOrderById);
router.get('/user/:userId', orderController.getUserOrders);
router.get('/vendor/:vendorId', orderController.getVendorOrders);
router.patch('/:id/status', orderController.updateOrderStatus);
router.post('/:id/cancel', orderController.cancelOrder);
router.post('/:id/chat', orderController.sendOrderChat);

export default router;
