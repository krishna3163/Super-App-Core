import DailyMetric from '../models/DailyMetric.js';
import Event from '../models/Event.js';

// Get dashboard metrics
export const getDashboardMetrics = async (req, res) => {
  try {
    const { service = 'all', days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));
    const startStr = startDate.toISOString().split('T')[0];

    const filter = { date: { $gte: startStr } };
    if (service !== 'all') filter.service = service;

    const metrics = await DailyMetric.find(filter).sort({ date: 1 });

    // Calculate totals
    const totals = metrics.reduce((acc, m) => {
      acc.totalEvents += m.metrics.totalEvents;
      acc.uniqueUsers += m.metrics.uniqueUsers;
      acc.revenue += m.metrics.revenue;
      acc.sessions += m.metrics.sessions;
      acc.orders += m.metrics.orders;
      acc.messages += m.metrics.messages;
      return acc;
    }, { totalEvents: 0, uniqueUsers: 0, revenue: 0, sessions: 0, orders: 0, messages: 0 });

    res.json({ 
      status: 'success', 
      data: { 
        totals,
        daily: metrics,
        period: { from: startStr, to: new Date().toISOString().split('T')[0], days: parseInt(days) }
      } 
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Get top pages
export const getTopPages = async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const topPages = await Event.aggregate([
      { $match: { eventType: 'page_view', timestamp: { $gte: since } } },
      { $group: { _id: '$page', views: { $sum: 1 }, uniqueUsers: { $addToSet: '$userId' } } },
      { $project: { _id: 0, page: '$_id', views: 1, uniqueUsers: { $size: '$uniqueUsers' } } },
      { $sort: { views: -1 } },
      { $limit: 20 }
    ]);

    res.json({ status: 'success', data: topPages });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Revenue analytics
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(days));

    const revenue = await Event.aggregate([
      { $match: { category: 'revenue', timestamp: { $gte: since } } },
      { $group: { 
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        totalRevenue: { $sum: '$value' },
        transactions: { $sum: 1 },
        avgOrderValue: { $avg: '$value' }
      }},
      { $sort: { '_id': 1 } }
    ]);

    const totalRevenue = revenue.reduce((sum, r) => sum + r.totalRevenue, 0);
    const totalTransactions = revenue.reduce((sum, r) => sum + r.transactions, 0);

    res.json({ 
      status: 'success', 
      data: { 
        daily: revenue, 
        summary: { totalRevenue, totalTransactions, avgOrderValue: totalTransactions > 0 ? totalRevenue / totalTransactions : 0 }
      } 
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// User retention cohorts
export const getRetentionCohorts = async (req, res) => {
  try {
    const { weeks = 8 } = req.query;
    const since = new Date();
    since.setDate(since.getDate() - parseInt(weeks) * 7);

    // Get signup events grouped by week
    const signups = await Event.aggregate([
      { $match: { eventType: 'signup', timestamp: { $gte: since } } },
      { $group: { 
        _id: { $dateToString: { format: '%Y-W%V', date: '$timestamp' } },
        users: { $addToSet: '$userId' },
        count: { $sum: 1 }
      }},
      { $sort: { '_id': 1 } }
    ]);

    res.json({ status: 'success', data: signups });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Aggregate daily metrics (ran by cron or manually)
export const aggregateDailyMetrics = async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date || new Date().toISOString().split('T')[0];
    const dayStart = new Date(targetDate);
    const dayEnd = new Date(targetDate);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const match = { timestamp: { $gte: dayStart, $lt: dayEnd } };

    const [totalEvents, uniqueUsers, pageViews, revenue, errors] = await Promise.all([
      Event.countDocuments(match),
      Event.distinct('userId', match),
      Event.countDocuments({ ...match, eventType: 'page_view' }),
      Event.aggregate([{ $match: { ...match, category: 'revenue' } }, { $group: { _id: null, total: { $sum: '$value' } } }]),
      Event.countDocuments({ ...match, eventType: 'error' })
    ]);

    const sessions = await Event.distinct('sessionId', match);

    const deviceBreakdown = await Event.aggregate([
      { $match: match },
      { $group: { _id: '$device.type', count: { $sum: 1 } } }
    ]);

    const devices = { mobile: 0, tablet: 0, desktop: 0 };
    deviceBreakdown.forEach(d => { if (d._id) devices[d._id] = d.count; });

    const topPages = await Event.aggregate([
      { $match: { ...match, eventType: 'page_view' } },
      { $group: { _id: '$page', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 10 },
      { $project: { _id: 0, page: '$_id', views: 1 } }
    ]);

    const metric = await DailyMetric.findOneAndUpdate(
      { date: targetDate, service: 'all' },
      {
        metrics: {
          totalEvents,
          uniqueUsers: uniqueUsers.length,
          sessions: sessions.length,
          pageViews,
          revenue: revenue[0]?.total || 0,
          errors
        },
        topPages,
        deviceBreakdown: devices
      },
      { upsert: true, new: true }
    );

    res.json({ status: 'success', data: metric });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
