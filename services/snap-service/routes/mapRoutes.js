import express from 'express';
import * as mapController from '../controllers/mapController.js';

const router = express.Router();

// User location updates & Ghost mode toggle
router.post('/location', mapController.updateLocation);

// Fetch visible friends map locations
router.get('/locations', mapController.getMapLocations);

export default router;
