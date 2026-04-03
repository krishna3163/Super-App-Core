import Comment from '../models/Comment.js';
import CommunityPost from '../models/CommunityPost.js';

export const addComment = async (req, res) => {
  try {
    const { postId, parentId, userId, userName, userAvatar, content } = req.body;
    let depth = 0;
    if (parentId) {
      const parent = await Comment.findById(parentId);
      depth = parent ? parent.depth + 1 : 0;
    }
    const comment = new Comment({ postId, parentId: parentId || null, userId, userName, userAvatar, content, depth });
    await comment.save();
    await CommunityPost.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });
    res.status(201).json({ status: 'success', data: comment });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const { sort = 'best' } = req.query;
    const sortMap = { best: { score: -1 }, new: { createdAt: -1 }, old: { createdAt: 1 }, controversial: { score: 1 } };

    const comments = await Comment.find({ postId, isRemoved: false }).sort(sortMap[sort] || sortMap.best);

    // Build thread tree
    const commentMap = {};
    const rootComments = [];
    comments.forEach(c => { commentMap[c._id] = { ...c.toObject(), replies: [] }; });
    comments.forEach(c => {
      if (c.parentId && commentMap[c.parentId]) {
        commentMap[c.parentId].replies.push(commentMap[c._id]);
      } else {
        rootComments.push(commentMap[c._id]);
      }
    });

    res.json({ status: 'success', data: rootComments, total: comments.length });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const voteComment = async (req, res) => {
  try {
    const { userId, vote } = req.body;
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    comment.upvotes = comment.upvotes.filter(u => u !== userId);
    comment.downvotes = comment.downvotes.filter(u => u !== userId);
    if (vote === 'up') comment.upvotes.push(userId);
    else if (vote === 'down') comment.downvotes.push(userId);
    comment.score = comment.upvotes.length - comment.downvotes.length;
    await comment.save();
    res.json({ status: 'success', data: { score: comment.score } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    await Comment.findByIdAndUpdate(req.params.commentId, { isRemoved: true, content: '[deleted]' });
    res.json({ status: 'success', message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const editComment = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findByIdAndUpdate(req.params.commentId, { content, isEdited: true }, { new: true });
    res.json({ status: 'success', data: comment });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
