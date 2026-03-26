import Status from '../models/Status.js';

export const uploadStatus = async (req, res) => {
  try {
    const { userId, content, mediaUrl, mediaType } = req.body;
    const status = new Status({ userId, content, mediaUrl, mediaType });
    await status.save();
    res.status(201).json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getStatuses = async (req, res) => {
  try {
    const { followingIds } = req.body; // List of userIds current user follows
    const statuses = await Status.find({ 
      userId: { $in: followingIds },
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    res.json(statuses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const viewStatus = async (req, res) => {
  try {
    const { statusId, userId } = req.body;
    await Status.findByIdAndUpdate(statusId, { $addToSet: { viewers: userId } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
