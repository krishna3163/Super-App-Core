import express from 'express';
import * as statusController from '../controllers/statusController.js';

const router = express.Router();

router.post('/upload', statusController.uploadStatus);
router.post('/feed', statusController.getStatuses);
router.post('/view', statusController.viewStatus);

export default router;
