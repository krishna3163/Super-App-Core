import express from 'express';
import rideController from '../controllers/rideController.js';
import driverController from '../controllers/driverController.js';

const router = express.Router();

// Rider
router.post('/request', rideController.requestRide);
router.post('/accept', rideController.acceptRide);
router.post('/complete/:rideId', rideController.completeRide);

// Driver
router.post('/driver/register', driverController.registerDriver);
router.patch('/driver/location', driverController.updateLocation);
router.get('/driver/earnings/:driverId', driverController.getEarnings);

export default router;
