import axios from 'axios';
import BusinessStats from '../models/BusinessStats.js';

export const getDashboardSummary = async (req, res) => {
  try {
    const { userId } = req.params;
    let stats = await BusinessStats.findOne({ userId });
    
    if (!stats) {
      stats = new BusinessStats({ userId, businessMode: true, roles: ['seller'] });
      await stats.save();
    }

    if (!stats.businessMode) {
      return res.status(403).json({ error: 'Business mode not enabled' });
    }

    const authHeader = req.headers['authorization'];
    const headers = { Authorization: authHeader };

    // Aggregate data from relevant services based on roles
    const summaryData = {
      profile: stats,
      analytics: stats.dailyStats.slice(-7), // Last 7 days
      seller: null,
      driver: null,
      restaurant: null,
      hotel: null,
      provider: null
    };

    const requests = [];

    if (stats.roles.includes('seller')) {
      requests.push(
        axios.get(`${process.env.MARKETPLACE_URL}/listings`, { headers, params: { sellerId: userId } })
          .then(r => summaryData.seller = { totalProducts: r.data.length })
          .catch(() => null)
      );
    }

    if (stats.roles.includes('driver')) {
      requests.push(
        axios.get(`${process.env.RIDE_URL}/driver/earnings/${userId}`, { headers })
          .then(r => summaryData.driver = r.data)
          .catch(() => null)
      );
    }

    await Promise.allSettled(requests);

    res.json(summaryData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleBusinessMode = async (req, res) => {
  try {
    const { userId, enabled } = req.body;
    const stats = await BusinessStats.findOneAndUpdate(
      { userId },
      { businessMode: enabled },
      { new: true, upsert: true }
    );
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
