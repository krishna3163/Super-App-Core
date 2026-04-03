import FranchiseBranch from '../models/FranchiseBranch.js';
import WebhookConfig from '../models/WebhookConfig.js';
import crypto from 'crypto';

// Branch / Franchise Logic
export const createBranch = async (req, res) => {
  try {
    const { parentBusinessId, branchName, address, location, managerId, localPricingModifier } = req.body;
    const branch = new FranchiseBranch({ parentBusinessId, branchName, address, location, managerId, localPricingModifier });
    await branch.save();
    res.status(201).json({ status: 'success', data: branch });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBranches = async (req, res) => {
  try {
    const { parentBusinessId } = req.params;
    const branches = await FranchiseBranch.find({ parentBusinessId, isActive: true });
    res.json({ status: 'success', data: branches });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Webhook / Enterprise API Push Logic
export const configureWebhooks = async (req, res) => {
  try {
    const { businessId, endpointUrl, activeEvents } = req.body;
    // Auto-generate a highly secure signing secret
    const secretToken = crypto.randomBytes(32).toString('hex');
    
    const config = await WebhookConfig.findOneAndUpdate(
      { businessId },
      { endpointUrl, activeEvents, secretToken },
      { new: true, upsert: true }
    );
    res.json({ status: 'success', data: config, message: 'Save the secretToken to verify payloads.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Internal controller purely used by other Super App services to trigger the dispatch.
// E.g. order-service calls this internally when an order is created.
export const triggerWebhookEvent = async (businessId, eventType, payload) => {
  try {
    const config = await WebhookConfig.findOne({ businessId, isActive: true });
    if (!config || !config.activeEvents.includes(eventType)) return false;

    // Simulate Axios HTTP POST to external enterprise system (Salesforce / Shopify sync)
    // const hmac = crypto.createHmac('sha256', config.secretToken).update(JSON.stringify(payload)).digest('hex');
    // await axios.post(config.endpointUrl, payload, { headers: { 'x-superapp-signature': hmac } });
    
    console.log(`[ENTERPRISE WEBHOOK] Dispatched ${eventType} to ${config.endpointUrl} for Corp: ${businessId}`);
    return true;
  } catch (err) {
    console.error('Webhook dispatch failed:', err);
    return false;
  }
};

export default { createBranch, getBranches, configureWebhooks, triggerWebhookEvent };
