import Thread from '../models/Thread.js';

const createThread = async (req, res) => {
  try {
    const { communityId, authorId, title, content, media } = req.body;
    const thread = new Thread({ communityId, authorId, title, content, media });
    await thread.save();
    res.status(201).json(thread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const voteThread = async (req, res) => {
  try {
    const { threadId, userId, voteType } = req.body; // 'upvote' or 'downvote'
    const thread = await Thread.findById(threadId);
    if (!thread) return res.status(404).json({ error: 'Thread not found' });

    if (voteType === 'upvote') {
      thread.downvotes = thread.downvotes.filter(id => id !== userId);
      if (thread.upvotes.includes(userId)) {
        thread.upvotes = thread.upvotes.filter(id => id !== userId);
      } else {
        thread.upvotes.push(userId);
      }
    } else if (voteType === 'downvote') {
      thread.upvotes = thread.upvotes.filter(id => id !== userId);
      if (thread.downvotes.includes(userId)) {
        thread.downvotes = thread.downvotes.filter(id => id !== userId);
      } else {
        thread.downvotes.push(userId);
      }
    }
    await thread.save();
    res.json(thread);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCommunityThreads = async (req, res) => {
  try {
    const { communityId } = req.params;
    const threads = await Thread.find({ communityId }).sort({ createdAt: -1 });
    res.json(threads);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createThread, voteThread, getCommunityThreads };
