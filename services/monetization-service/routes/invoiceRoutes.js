import express from 'express';
import * as invoiceController from '../controllers/invoiceController.js';

const router = express.Router();

router.post('/generate', invoiceController.generateInvoice);
router.get('/business/:businessId', invoiceController.getBusinessInvoices);

export default router;
