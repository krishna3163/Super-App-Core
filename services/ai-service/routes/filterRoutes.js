import express from 'express';
import * as filterController from '../controllers/filterController.js';

const router = express.Router();

router.get('/', filterController.getArFilters);
router.post('/apply', filterController.applyFilterMock);

export default router;
