import Story from '../models/Story.js';

const createStory = async (req, res) => {
  try {
    const { userId, userName, userAvatar, mediaUrl, media, mediaType, caption } = req.body;
    const story = new Story({ userId, userName, userAvatar, mediaUrl: mediaUrl || media, media, mediaType, caption });
    await story.save();
    res.status(201).json(story);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getStories = async (req, res) => {
  try {
    const { followingIds } = req.body; // Fetch stories from people you follow
    const stories = await Story.find({ userId: { $in: followingIds } }).sort({ createdAt: -1 });
    res.json(stories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const viewStory = async (req, res) => {
  try {
    const { storyId, userId } = req.body;
    await Story.findByIdAndUpdate(storyId, { $addToSet: { viewers: userId } });
    res.json({ message: 'Story viewed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createStory, getStories, viewStory };
