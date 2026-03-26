import express from 'express';
import restaurantController from '../controllers/restaurantController.js';
import orderController from '../controllers/orderController.js';

const router = express.Router();

// Restaurant
router.post('/restaurants', restaurantController.addRestaurant);
router.get('/restaurants', restaurantController.getRestaurants);
router.get('/restaurants/:id', restaurantController.getRestaurantById);
router.post('/restaurants/review', restaurantController.addReview);
// Table booking (simple — stored as food orders with type='table')
router.post('/restaurants/table-book', orderController.placeTableBooking);
router.get('/restaurants/table-bookings/:restaurantId', orderController.getTableBookings);

// Order
router.post('/orders', orderController.placeOrder);
router.patch('/orders/status', orderController.updateOrderStatus);
router.get('/orders/history/:userId', orderController.getOrderHistory);
router.get('/orders/active/:userId', orderController.getActiveOrders);
router.post('/orders/chat', orderController.sendOrderChat);
// Vendor side
router.get('/orders/restaurant/:restaurantId', orderController.getRestaurantOrders);
router.patch('/orders/:orderId/status', orderController.updateOrderStatusById);

export default router;
