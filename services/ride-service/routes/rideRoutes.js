import express from 'express';
import rideController from '../controllers/rideController.js';

const router = express.Router();

// User side
router.post('/book', rideController.bookRide);
router.get('/history/:userId', rideController.getRideHistory);
router.get('/active/:userId', rideController.getActiveRide);

// Driver/Vendor side
router.get('/pending', rideController.getPendingRides);
router.patch('/status', rideController.updateRideStatus);
router.patch('/:rideId/accept', rideController.acceptRide);
router.patch('/:rideId/reject', rideController.rejectRide);

export default router;
