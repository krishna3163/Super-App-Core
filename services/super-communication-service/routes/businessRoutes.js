import express from 'express';
import * as businessController from '../controllers/businessController.js';

const router = express.Router();

router.post('/create', businessController.createOrUpdateBusiness);
router.get('/:id', businessController.getBusinessProfile);
router.post('/catalog', businessController.addToCatalog);

export default router;
