import express from 'express';
import { getDashboardSummary, toggleBusinessMode, updateSettings, recordSale, getRevenueChart, markNotificationsRead, getTopSellingProducts } from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/summary/:userId', getDashboardSummary);
router.post('/toggle', toggleBusinessMode);
router.put('/settings/:userId', updateSettings);
router.post('/sale', recordSale);
router.get('/revenue/:userId', getRevenueChart);
router.post('/notifications/:userId/read', markNotificationsRead);
router.get('/top-products/:userId', getTopSellingProducts);

export default router;
