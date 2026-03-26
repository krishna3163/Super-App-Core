import express from 'express';
import miniAppController from '../controllers/miniAppController.js';
import internalApiController from '../controllers/internalApiController.js';

const router = express.Router();

// Registry
router.post('/registry', miniAppController.registerApp);
router.get('/registry', miniAppController.getApps);
router.get('/registry/:appId', miniAppController.getAppById);
router.patch('/registry/:appId/status', miniAppController.updateAppStatus);

// Internal API (for mini apps)
router.get('/api/context/:appId', internalApiController.getUserContext);
router.post('/api/notify', internalApiController.notify);

export default router;
