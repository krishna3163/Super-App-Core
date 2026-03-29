import express from 'express';
import * as analyticsController from '../controllers/analyticsController.js';

const router = express.Router();

router.post('/events', analyticsController.trackEvent);
router.get('/:businessId/funnel', analyticsController.getBusinessDashboardStats);

export default router;
