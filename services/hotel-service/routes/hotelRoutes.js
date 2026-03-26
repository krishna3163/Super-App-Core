import express from 'express';
import hotelController from '../controllers/hotelController.js';
import bookingController from '../controllers/bookingController.js';

const router = express.Router();

// Hotel Owner / Management
router.post('/', hotelController.addHotel);
router.post('/rooms', hotelController.addRooms);

// Discovery
router.get('/search', hotelController.searchHotels);
router.get('/:id', hotelController.getHotelDetails);

// Booking — User side
router.post('/book', bookingController.createBooking);
router.get('/bookings/user/:userId', bookingController.getMyBookings);
router.post('/bookings/cancel/:bookingId', bookingController.cancelBooking);

// Booking — Vendor/Hotel side
router.get('/bookings/hotel/:hotelId', bookingController.getHotelBookings);
router.patch('/bookings/:bookingId/status', bookingController.updateBookingStatus);
router.post('/bookings/:bookingId/chat', bookingController.sendBookingChat);

export default router;
