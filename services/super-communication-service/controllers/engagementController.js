import Poll from '../models/Poll.js';
import Engagement from '../models/Engagement.js';

// Poll Controllers
export const createPoll = async (req, res) => {
  try {
    const poll = new Poll(req.body);
    await poll.save();
    res.status(201).json(poll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const votePoll = async (req, res) => {
  try {
    const { pollId, optionId, userId } = req.body;
    const poll = await Poll.findById(pollId);
    
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    // Remove user's previous vote if single choice
    if (!poll.allowMultiple) {
      poll.options.forEach(opt => {
        opt.votes = opt.votes.filter(id => id !== userId);
      });
    }

    // Add new vote
    const option = poll.options.find(opt => opt.id === optionId);
    if (option && !option.votes.includes(userId)) {
      option.votes.push(userId);
    }

    await poll.save();
    res.json(poll);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Engagement (Event, Notice, Alert, Reminder) Controllers
export const createEngagement = async (req, res) => {
  try {
    const engagement = new Engagement(req.body);
    await engagement.save();
    res.status(201).json(engagement);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getEngagements = async (req, res) => {
  try {
    const { targetId } = req.params;
    const engagements = await Engagement.find({ 
      targetId,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: { $gt: new Date() } }
      ]
    }).sort({ createdAt: -1 });
    res.json(engagements);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
