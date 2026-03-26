import express from 'express';
import * as providerController from '../controllers/serviceProviderController.js';
import * as bookingController from '../controllers/serviceBookingController.js';

const router = express.Router();

// Providers
router.post('/providers', providerController.createProviderProfile);
router.get('/providers/search', providerController.searchProviders);
router.get('/providers/:id', providerController.getProviderById);

// Bookings
router.post('/bookings', bookingController.createBooking);
router.patch('/bookings/status', bookingController.updateBookingStatus);
router.get('/bookings/user/:userId', bookingController.getBookings);

export default router;
