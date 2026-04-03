import ProfilePrivacy from '../models/ProfilePrivacy.js';

export const getPrivacySettings = async (req, res) => {
  try {
    const { userId } = req.params;
    let privacy = await ProfilePrivacy.findOne({ userId });
    
    if (!privacy) {
      privacy = new ProfilePrivacy({ userId });
      await privacy.save();
    }
    
    res.json(privacy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const updatePrivacySettings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fields, customAllowedUsers, customBlockedUsers } = req.body;

    const privacy = await ProfilePrivacy.findOneAndUpdate(
      { userId },
      { fields, customAllowedUsers, customBlockedUsers },
      { new: true, upsert: true }
    );
    
    res.json(privacy);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
