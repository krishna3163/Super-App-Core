import Story from '../models/Story.js';
import Highlight from '../models/Highlight.js';

// Create story
export const createStory = async (req, res) => {
  try {
    const story = new Story(req.body);
    await story.save();
    res.status(201).json({ status: 'success', data: story });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Get stories feed (from people you follow)
export const getFeed = async (req, res) => {
  try {
    const { followingIds, userId } = req.body;
    const ids = followingIds && followingIds.length > 0 ? [...followingIds, userId] : [];
    const filter = { isActive: true, hiddenFrom: { $ne: userId } };
    if (ids.length > 0) filter.userId = { $in: ids };

    const stories = await Story.find(filter).sort({ createdAt: -1 });

    // Group by user
    const grouped = {};
    stories.forEach(s => {
      if (!grouped[s.userId]) {
        grouped[s.userId] = { userId: s.userId, userName: s.userName, userAvatar: s.userAvatar, stories: [], hasUnviewed: false };
      }
      const isViewed = s.viewers.some(v => v.userId === userId);
      if (!isViewed) grouped[s.userId].hasUnviewed = true;
      grouped[s.userId].stories.push(s);
    });

    const result = Object.values(grouped).sort((a, b) => {
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      return 0;
    });

    res.json({ status: 'success', data: result });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// View a story
export const viewStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const { userId } = req.body;
    const story = await Story.findById(storyId);
    if (!story) return res.status(404).json({ status: 'fail', message: 'Story not found' });

    const alreadyViewed = story.viewers.some(v => v.userId === userId);
    if (!alreadyViewed) {
      story.viewers.push({ userId, viewedAt: new Date() });
      story.viewCount += 1;
      await story.save();
    }
    res.json({ status: 'success', data: story });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Get story viewers
export const getViewers = async (req, res) => {
  try {
    const story = await Story.findById(req.params.storyId).select('viewers viewCount');
    if (!story) return res.status(404).json({ error: 'Story not found' });
    res.json({ status: 'success', data: { viewers: story.viewers, viewCount: story.viewCount } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// React to story
export const reactToStory = async (req, res) => {
  try {
    const { userId, emoji } = req.body;
    const story = await Story.findById(req.params.storyId);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    const existing = story.reactions.findIndex(r => r.userId === userId);
    if (existing > -1) story.reactions.splice(existing, 1);
    story.reactions.push({ userId, emoji, reactedAt: new Date() });
    await story.save();
    res.json({ status: 'success', data: story });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Reply to story
export const replyToStory = async (req, res) => {
  try {
    const { userId, userName, message } = req.body;
    const story = await Story.findById(req.params.storyId);
    if (!story) return res.status(404).json({ error: 'Story not found' });

    story.replies.push({ userId, userName, message, createdAt: new Date() });
    await story.save();
    res.json({ status: 'success', data: story });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Delete story
export const deleteStory = async (req, res) => {
  try {
    await Story.findByIdAndUpdate(req.params.storyId, { isActive: false });
    res.json({ status: 'success', message: 'Story deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Get user's own stories (with analytics)
export const getMyStories = async (req, res) => {
  try {
    const stories = await Story.find({ userId: req.params.userId, isActive: true }).sort({ createdAt: -1 });
    res.json({ status: 'success', data: stories });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// === HIGHLIGHTS ===
export const createHighlight = async (req, res) => {
  try {
    const highlight = new Highlight(req.body);
    await highlight.save();
    res.status(201).json({ status: 'success', data: highlight });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getUserHighlights = async (req, res) => {
  try {
    const highlights = await Highlight.find({ userId: req.params.userId }).populate('storyIds').sort({ position: 1 });
    res.json({ status: 'success', data: highlights });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const addToHighlight = async (req, res) => {
  try {
    const { storyId } = req.body;
    const highlight = await Highlight.findByIdAndUpdate(
      req.params.highlightId,
      { $addToSet: { storyIds: storyId } },
      { new: true }
    );
    res.json({ status: 'success', data: highlight });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const deleteHighlight = async (req, res) => {
  try {
    await Highlight.findByIdAndDelete(req.params.highlightId);
    res.json({ status: 'success', message: 'Highlight deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
