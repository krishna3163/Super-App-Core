import Settings from '../models/Settings.js';

const getSettings = async (req, res) => {
  try {
    const { userId } = req.params;
    let settings = await Settings.findOne({ userId });
    
    if (!settings) {
      // Create default settings if not exists
      settings = new Settings({ userId });
      await settings.save();
    }
    
    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateSection = async (req, res) => {
  try {
    const { userId, section } = req.params;
    const updateData = req.body;

    // Phase S2: Change Username Check
    if (section === 'profile' && updateData.username) {
      const existing = await Settings.findOne({ 'profile.username': updateData.username, userId: { $ne: userId } });
      if (existing) return res.status(400).json({ error: 'Username already taken' });
    }

    const settings = await Settings.findOneAndUpdate(
      { userId },
      { $set: { [section]: updateData } },
      { new: true, upsert: true }
    );

    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const clearSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    const settings = await Settings.findOneAndUpdate(
      { userId },
      { $set: { 'security.activeSessions': [] } },
      { new: true }
    );
    res.json({ success: true, message: 'All sessions cleared' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { targetUserId } = req.body;
    
    const settings = await Settings.findOneAndUpdate(
      { userId },
      { $addToSet: { 'privacy.blockedUsers': targetUserId } },
      { new: true, upsert: true }
    );
    
    res.json(settings.privacy.blockedUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { getSettings, updateSection, blockUser };
