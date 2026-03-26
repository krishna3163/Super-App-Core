import Block from '../models/Block.js';
import Report from '../models/Report.js';

export const blockUser = async (req, res) => {
  try {
    const { blockerId, blockedId } = req.body;
    const block = new Block({ blockerId, blockedId });
    await block.save();
    res.status(201).json({ message: 'User blocked successfully', block });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'User is already blocked' });
    res.status(500).json({ error: err.message });
  }
};

export const reportUser = async (req, res) => {
  try {
    const { reporterId, reportedId, reason, description, contextData } = req.body;
    const report = new Report({ reporterId, reportedId, reason, description, contextData });
    await report.save();
    res.status(201).json({ message: 'Report submitted successfully', report });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getBlockedUsers = async (req, res) => {
  try {
    const { userId } = req.params;
    const blocks = await Block.find({ blockerId: userId });
    res.json(blocks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
