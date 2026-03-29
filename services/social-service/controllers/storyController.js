import Story from '../models/Story.js';

const createStory = async (req, res) => {
  try {
    const { userId, userName, userAvatar, mediaUrl, media, mediaType, caption } = req.body;
    if (!userId || !(mediaUrl || media)) {
      return res.status(400).json({ status: 'fail', message: 'userId and media are required' });
    }
    const story = new Story({ userId, userName, userAvatar, mediaUrl: mediaUrl || media, media, mediaType, caption });
    await story.save();
    res.status(201).json({ status: 'success', data: story });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const getStories = async (req, res) => {
  try {
    const { followingIds, userId } = req.body || {};
    const ids = Array.isArray(followingIds) ? followingIds.filter(Boolean) : [];
    if (userId && !ids.includes(userId)) ids.push(userId);

    const filter = ids.length > 0 ? { userId: { $in: ids } } : {};
    const stories = await Story.find(filter).sort({ createdAt: -1 });
    res.json({ status: 'success', data: stories });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

const viewStory = async (req, res) => {
  try {
    const { storyId, userId } = req.body;
    await Story.findByIdAndUpdate(storyId, { $addToSet: { viewers: userId } });
    res.json({ status: 'success', message: 'Story viewed' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export default { createStory, getStories, viewStory };
