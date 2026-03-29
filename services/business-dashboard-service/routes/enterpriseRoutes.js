import express from 'express';
import * as enterpriseController from '../controllers/enterpriseController.js';

const router = express.Router();

router.post('/franchise/branch', enterpriseController.createBranch);
router.get('/franchise/:parentBusinessId', enterpriseController.getBranches);

router.post('/webhooks/config', enterpriseController.configureWebhooks);
// Internal API for simulated testing. In production, this is called internally, not exposed over HTTP.
router.post('/webhooks/trigger', async (req, res) => {
  const result = await enterpriseController.triggerWebhookEvent(req.body.businessId, req.body.eventType, req.body.payload);
  res.json({ status: result ? 'success' : 'skipped', message: 'Webhook dispatch cycle completed.' });
});

export default router;
