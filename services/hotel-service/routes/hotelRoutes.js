import express from 'express';
import hotelController from '../controllers/hotelController.js';
import bookingController from '../controllers/bookingController.js';
import { addReview, getHotelReviews, likeReview, ownerReplyToReview, addToWishlist, getWishlist, removeFromWishlist } from '../controllers/reviewController.js';

const router = express.Router();

// Hotel Owner / Management
router.post('/', hotelController.addHotel);
router.put('/:id', hotelController.updateHotel);
router.post('/rooms', hotelController.addRooms);
router.get('/owner/:ownerId', hotelController.getOwnerHotels);

// Discovery
router.get('/search', hotelController.searchHotels);
router.get('/featured', hotelController.getFeaturedHotels);
router.get('/nearby', hotelController.getNearbyHotels);
router.get('/:id', hotelController.getHotelDetails);

// Reviews
router.post('/reviews', addReview);
router.get('/reviews/:hotelId', getHotelReviews);
router.post('/reviews/:reviewId/like', likeReview);
router.post('/reviews/:reviewId/reply', ownerReplyToReview);

// Wishlist
router.post('/wishlist', addToWishlist);
router.get('/wishlist/:userId', getWishlist);
router.delete('/wishlist/:itemId', removeFromWishlist);

// Booking — User side
router.post('/book', bookingController.createBooking);
router.get('/bookings/user/:userId', bookingController.getMyBookings);
router.post('/bookings/cancel/:bookingId', bookingController.cancelBooking);

// Booking — Vendor/Hotel side
router.get('/bookings/hotel/:hotelId', bookingController.getHotelBookings);
router.patch('/bookings/:bookingId/status', bookingController.updateBookingStatus);
router.post('/bookings/:bookingId/chat', bookingController.sendBookingChat);

export default router;
