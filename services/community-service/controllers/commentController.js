import Comment from '../models/Comment.js';
import Thread from '../models/Thread.js';

const addComment = async (req, res) => {
  try {
    const { threadId, authorId, parentId, content } = req.body;
    const comment = new Comment({ threadId, authorId, parentId, content });
    await comment.save();
    
    await Thread.findByIdAndUpdate(threadId, { $inc: { commentCount: 1 } });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getThreadComments = async (req, res) => {
  try {
    const { threadId } = req.params;
    const comments = await Comment.find({ threadId }).sort({ createdAt: 1 });
    // In a real app, you'd build a tree structure here
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const voteComment = async (req, res) => {
  try {
    const { commentId, userId, voteType } = req.body;
    const comment = await Comment.findById(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    if (voteType === 'upvote') {
      comment.downvotes = comment.downvotes.filter(id => id !== userId);
      if (comment.upvotes.includes(userId)) {
        comment.upvotes = comment.upvotes.filter(id => id !== userId);
      } else {
        comment.upvotes.push(userId);
      }
    } else if (voteType === 'downvote') {
      comment.upvotes = comment.upvotes.filter(id => id !== userId);
      if (comment.downvotes.includes(userId)) {
        comment.downvotes = comment.downvotes.filter(id => id !== userId);
      } else {
        comment.downvotes.push(userId);
      }
    }
    await comment.save();
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { addComment, getThreadComments, voteComment };
