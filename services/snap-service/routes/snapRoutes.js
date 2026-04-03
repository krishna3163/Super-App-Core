import express from 'express';
import * as snapController from '../controllers/snapController.js';
import * as memoryController from '../controllers/memoryController.js';
import * as storyController from '../controllers/storyController.js';
import * as mapController from '../controllers/mapController.js';

const router = express.Router();

// SNAP OPERATIONS
router.post('/send', snapController.sendSnap);
router.get('/inbox', snapController.getSnaps); // Renamed from getSnaps to inbox
router.post('/:id/open', snapController.viewSnap); // Renamed from view to open and PATCH to POST
router.post('/:id/replay', snapController.replaySnap);
router.patch('/screenshot/:snapId', snapController.markScreenshot);

// STORY OPERATIONS
router.put('/story/audience', storyController.updateStoryAudience);
router.get('/story/access', storyController.checkStoryAccess);

// MAP OPERATIONS
router.post('/map/location', mapController.updateLocation);
router.get('/map/locations', mapController.getMapLocations);

// MEMORY VAULT OPERATIONS
router.post('/memories', memoryController.saveMemory);
router.get('/memories/:userId', memoryController.getMemories);
router.delete('/memories/:memoryId', memoryController.deleteMemory);

export default router;
