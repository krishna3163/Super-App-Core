import express from 'express';
import rideController from '../controllers/rideController.js';
import driverController from '../controllers/driverController.js';

const router = express.Router();

// Ride operations
router.post('/estimate', rideController.getFareEstimate);
router.post('/request', rideController.requestRide);
router.post('/accept', rideController.acceptRide);
router.post('/:rideId/start', rideController.startRide);
router.post('/:rideId/complete', rideController.completeRide);
router.post('/:rideId/cancel', rideController.cancelRide);
router.post('/:rideId/rate', rideController.rateRide);
router.get('/:rideId/track', rideController.trackRide);
router.get('/history/:userId', rideController.getRideHistory);
router.post('/sos', rideController.sosEmergency);

// Driver operations
router.post('/driver/register', driverController.registerDriver);
router.get('/driver/profile/:userId', driverController.getDriverProfile);
router.post('/driver/location', driverController.updateLocation);
router.post('/driver/toggle', driverController.toggleOnline);
router.get('/driver/earnings/:userId', driverController.getEarnings);
router.get('/driver/nearby', driverController.getNearbyDrivers);

export default router;
