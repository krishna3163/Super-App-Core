import Event from '../models/Event.js';

// Track a single event
export const trackEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json({ status: 'success', data: event });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Track batch events
export const trackBatch = async (req, res) => {
  try {
    const { events } = req.body;
    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ status: 'fail', message: 'events array required' });
    }
    const result = await Event.insertMany(events, { ordered: false });
    res.status(201).json({ status: 'success', inserted: result.length });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Get events for a user
export const getUserEvents = async (req, res) => {
  try {
    const { userId } = req.params;
    const { eventType, category, from, to, page = 1, limit = 50 } = req.query;
    
    const filter = { userId };
    if (eventType) filter.eventType = eventType;
    if (category) filter.category = category;
    if (from || to) {
      filter.timestamp = {};
      if (from) filter.timestamp.$gte = new Date(from);
      if (to) filter.timestamp.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [events, total] = await Promise.all([
      Event.find(filter).sort({ timestamp: -1 }).skip(skip).limit(parseInt(limit)),
      Event.countDocuments(filter)
    ]);

    res.json({ 
      status: 'success', 
      data: events, 
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Real-time event stream (last N minutes)
export const getRealtimeEvents = async (req, res) => {
  try {
    const { minutes = 5, eventType } = req.query;
    const since = new Date(Date.now() - parseInt(minutes) * 60 * 1000);
    
    const filter = { timestamp: { $gte: since } };
    if (eventType) filter.eventType = eventType;

    const events = await Event.find(filter).sort({ timestamp: -1 }).limit(200);
    const uniqueUsers = await Event.distinct('userId', filter);

    res.json({ 
      status: 'success', 
      data: { 
        events, 
        activeUsers: uniqueUsers.length, 
        eventCount: events.length,
        timeWindow: `${minutes} minutes`
      } 
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Event type breakdown
export const getEventBreakdown = async (req, res) => {
  try {
    const { from, to, groupBy = 'eventType' } = req.query;
    const match = {};
    if (from || to) {
      match.timestamp = {};
      if (from) match.timestamp.$gte = new Date(from);
      if (to) match.timestamp.$lte = new Date(to);
    }

    const breakdown = await Event.aggregate([
      { $match: match },
      { $group: { _id: `$${groupBy}`, count: { $sum: 1 }, uniqueUsers: { $addToSet: '$userId' } } },
      { $project: { _id: 0, [groupBy]: '$_id', count: 1, uniqueUsers: { $size: '$uniqueUsers' } } },
      { $sort: { count: -1 } },
      { $limit: 50 }
    ]);

    res.json({ status: 'success', data: breakdown });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// User journey / session path
export const getUserJourney = async (req, res) => {
  try {
    const { userId } = req.params;
    const { sessionId } = req.query;
    
    const filter = { userId };
    if (sessionId) filter.sessionId = sessionId;

    const events = await Event.find(filter)
      .sort({ timestamp: 1 })
      .limit(500)
      .select('eventType page properties timestamp sessionId');

    // Group by session
    const sessions = {};
    events.forEach(e => {
      const sid = e.sessionId || 'unknown';
      if (!sessions[sid]) sessions[sid] = [];
      sessions[sid].push(e);
    });

    res.json({ status: 'success', data: { sessions, totalEvents: events.length } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
