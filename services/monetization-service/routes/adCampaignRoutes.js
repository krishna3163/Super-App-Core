import express from 'express';
import * as adCampaignController from '../controllers/adCampaignController.js';

const router = express.Router();

router.post('/', adCampaignController.createCampaign);
router.get('/:businessId', adCampaignController.getCampaigns);
router.post('/click', adCampaignController.recordAdClick);

export default router;
