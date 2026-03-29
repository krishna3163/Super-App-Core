import express from 'express';
import * as crmController from '../controllers/crmController.js';

const router = express.Router();

// CRM Bookings
router.post('/bookings', crmController.createBooking);
router.get('/:businessId/bookings', crmController.getBusinessBookings);

// Staff Roster
router.post('/staff', crmController.addEmployee);
router.get('/:businessId/staff', crmController.getBusinessStaff);

// AI Customer Support Bot Config
router.post('/chatbot/config', crmController.updateAiBotConfig);
router.post('/chatbot/simulate', crmController.simulateAiReply);

export default router;
