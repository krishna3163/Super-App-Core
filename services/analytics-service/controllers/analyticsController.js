import FunnelStats from '../models/FunnelStats.js';

export const trackEvent = async (req, res) => {
  try {
    const { businessId, metricType, value = 1 } = req.body;
    const stat = new FunnelStats({ businessId, metricType, value });
    await stat.save();
    res.status(201).json({ status: 'success', data: stat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBusinessDashboardStats = async (req, res) => {
  try {
    const { businessId } = req.params;
    
    const stats = await FunnelStats.aggregate([
      { $match: { businessId } },
      { $group: { _id: '$metricType', total: { $sum: '$value' } } }
    ]);
    
    // Format perfectly
    const formattedStats = {};
    stats.forEach(item => {
      formattedStats[item._id] = item.total;
    });

    res.json({ status: 'success', data: formattedStats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { trackEvent, getBusinessDashboardStats };
