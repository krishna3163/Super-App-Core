import AdCampaign from '../models/AdCampaign.js';
import mongoose from 'mongoose';

// Business Ads Manager
export const createCampaign = async (req, res) => {
  try {
    const { businessId, title, objective, targetAudience, dailyBudget, startDate, endDate, creatives } = req.body;
    
    // In production, we'd deduct initial budget from Wallet.
    const campaign = new AdCampaign({
      businessId, title, objective, targetAudience, dailyBudget, startDate, endDate, creatives
    });
    await campaign.save();

    res.status(201).json({ status: 'success', data: campaign });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getCampaigns = async (req, res) => {
  try {
    const { businessId } = req.params;
    const campaigns = await AdCampaign.find({ businessId }).sort({ createdAt: -1 });
    res.json({ status: 'success', data: campaigns });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const recordAdClick = async (req, res) => {
  try {
    const { campaignId, userId } = req.body;
    // Log click, increment analytics, standard ad system
    const campaign = await AdCampaign.findByIdAndUpdate(
      campaignId,
      { 
        $inc: { 'analytics.clicks': 1, 'analytics.spend': 0.15 } // Deduct $0.15 CPC mock
      },
      { new: true }
    );
    res.json({ status: 'success', data: campaign });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createCampaign, getCampaigns, recordAdClick };
