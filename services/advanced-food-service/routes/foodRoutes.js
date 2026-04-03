import express from 'express';
import foodController from '../controllers/foodController.js';
import deliveryController from '../controllers/deliveryController.js';

const router = express.Router();

// Restaurant discovery
router.get('/restaurants', foodController.searchRestaurants);
router.get('/restaurants/:id', foodController.getRestaurantDetails);
router.get('/restaurants/:id/menu', foodController.getMenu);

// Orders
router.post('/orders', foodController.placeOrder);
router.patch('/orders/:orderId/status', foodController.updateOrderStatus);
router.get('/orders/history/:userId', foodController.getOrderHistory);
router.get('/orders/:orderId/track', foodController.trackOrder);
router.post('/orders/:orderId/rate', foodController.rateOrder);
router.post('/orders/:orderId/reorder', foodController.reorderPrevious);

// Delivery Partner
router.post('/delivery/register', deliveryController.registerPartner);
router.post('/delivery/accept', deliveryController.acceptDelivery);
router.post('/delivery/complete', deliveryController.completeDelivery);
router.get('/delivery/earnings/:partnerId', deliveryController.getEarnings);

export default router;
