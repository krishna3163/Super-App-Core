import express from 'express';
import restaurantController from '../controllers/restaurantController.js';
import orderController from '../controllers/orderController.js';
import * as tableBookingController from '../controllers/tableBookingController.js';

const router = express.Router();

// Restaurant
router.post('/restaurants', restaurantController.addRestaurant);
router.get('/restaurants', restaurantController.getRestaurants);
router.get('/restaurants/:id', restaurantController.getRestaurantById);
router.post('/restaurants/review', restaurantController.addReview);

// Table booking
router.post('/restaurants/table-bookings', tableBookingController.createTableBooking);
router.get('/restaurants/table-bookings/user/:userId', tableBookingController.getMyTableBookings);
router.get('/restaurants/table-bookings/:restaurantId', tableBookingController.getRestaurantTableBookings);
router.patch('/restaurants/table-bookings/:bookingId', tableBookingController.updateTableBookingStatus);

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
