import express from 'express';
import * as infoController from '../controllers/infoController.js';

const router = express.Router();

router.get('/group/:id', infoController.getGroupInfo);
router.get('/channel/:id', infoController.getChannelInfo);

export default router;
