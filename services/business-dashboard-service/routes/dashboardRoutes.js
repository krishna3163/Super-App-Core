import express from 'express';
import * as dashboardController from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/summary/:userId', dashboardController.getDashboardSummary);
router.post('/toggle', dashboardController.toggleBusinessMode);

export default router;
