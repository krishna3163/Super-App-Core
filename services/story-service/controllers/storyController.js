import Story from '../models/Story.js';

export const createStory = async (req, res) => {
  try {
    const { userId, mediaUrl, mediaType, caption } = req.body;
    const story = new Story({ userId, mediaUrl, mediaType, caption });
    await story.save();
    res.status(201).json({ status: 'success', data: story });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getFeed = async (req, res) => {
  try {
    const { followingIds } = req.body; // In real app, this would be an array of IDs
    const filter = followingIds && followingIds.length > 0 ? { userId: { $in: followingIds } } : {};
    const stories = await Story.find(filter).sort({ createdAt: -1 });
    res.json({ status: 'success', data: stories });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { userId } = req.body;
    await Story.findByIdAndUpdate(storyId, { $addToSet: { viewers: userId } });
    res.json({ status: 'success', message: 'Story marked as viewed' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
