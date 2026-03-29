import Notification from '../models/Notification.js';
import Preference from '../models/Preference.js';

export const createNotification = async (req, res) => {
  try {
    const notification = new Notification(req.body);
    await notification.save();
    res.status(201).json({ status: 'success', data: notification });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const batchNotify = async (req, res) => {
  try {
    const { notifications } = req.body; // array of notification objects
    const created = await Notification.insertMany(notifications);
    res.status(201).json({ status: 'success', data: { count: created.length } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ status: 'fail', message: 'User ID is required' });

    const { type, unreadOnly, page = 1, limit = 30 } = req.query;
    const filter = { userId };
    if (type) filter.type = type;
    if (unreadOnly === 'true') filter.isRead = false;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId, isRead: false })
    ]);

    // Always return 200 even if empty to prevent frontend errors
    res.json({ 
      status: 'success', 
      data: notifications || [], 
      unreadCount: unreadCount || 0, 
      pagination: { 
        page: parseInt(page), 
        limit: parseInt(limit), 
        total: total || 0 
      } 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    await Notification.findByIdAndUpdate(notificationId, { isRead: true, readAt: new Date() });
    res.json({ status: 'success', message: 'Marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await Notification.updateMany({ userId, isRead: false }, { isRead: true, readAt: new Date() });
    res.json({ status: 'success', message: 'All marked as read' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.notificationId);
    res.json({ status: 'success', message: 'Notification deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const clearAll = async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { userId: req.params.userId };
    if (type) filter.type = type;
    await Notification.deleteMany(filter);
    res.json({ status: 'success', message: 'Notifications cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const counts = await Notification.aggregate([
      { $match: { userId: req.params.userId, isRead: false } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);
    const total = counts.reduce((sum, c) => sum + c.count, 0);
    const byType = counts.reduce((acc, c) => { acc[c._id] = c.count; return acc; }, {});
    res.json({ status: 'success', data: { total, byType } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Preferences
export const getPreferences = async (req, res) => {
  try {
    let prefs = await Preference.findOne({ userId: req.params.userId });
    if (!prefs) { prefs = new Preference({ userId: req.params.userId }); await prefs.save(); }
    res.json({ status: 'success', data: prefs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePreferences = async (req, res) => {
  try {
    const prefs = await Preference.findOneAndUpdate({ userId: req.params.userId }, req.body, { new: true, upsert: true });
    res.json({ status: 'success', data: prefs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const muteUser = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    await Preference.findOneAndUpdate({ userId: req.params.userId }, { $addToSet: { mutedUsers: targetUserId } }, { upsert: true });
    res.json({ status: 'success', message: 'User muted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const unmuteUser = async (req, res) => {
  try {
    const { targetUserId } = req.body;
    await Preference.findOneAndUpdate({ userId: req.params.userId }, { $pull: { mutedUsers: targetUserId } });
    res.json({ status: 'success', message: 'User unmuted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
