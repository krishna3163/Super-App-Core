import Post from '../models/Post.js';
import Comment from '../models/Comment.js';

// Create post (with userName/userAvatar stored for display)
const createPost = async (req, res) => {
  try {
    const { userId, userName, userAvatar, content, type, media, hashtags, metadata, isReel } = req.body;
    const post = new Post({ userId, userName, userAvatar, content, type, media, hashtags, metadata, isReel });
    await post.save();
    res.status(201).json({ status: 'success', data: post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle like
const likePost = async (req, res) => {
  try {
    const { postId, userId } = req.body;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.likes.includes(userId)) {
      post.likes = post.likes.filter(id => id !== userId);
    } else {
      post.likes.push(userId);
    }
    await post.save();
    res.json({ status: 'success', data: post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Vote on poll option
const votePoll = async (req, res) => {
  try {
    const { postId, userId, optionIndex } = req.body;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    if (post.type !== 'poll') return res.status(400).json({ error: 'Not a poll post' });

    // Remove user from all options first (one vote per user)
    const totalOptions = post.metadata?.options?.length || 0;
    for (let i = 0; i < totalOptions; i++) {
      const key = String(i);
      const existing = post.pollVotes.get(key) || [];
      post.pollVotes.set(key, existing.filter(id => id !== userId));
    }

    // Add vote to chosen option
    const key = String(optionIndex);
    const current = post.pollVotes.get(key) || [];
    current.push(userId);
    post.pollVotes.set(key, current);
    post.markModified('pollVotes');

    await post.save();
    res.json({ status: 'success', data: post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Add comment
const addComment = async (req, res) => {
  try {
    const { postId, userId, userName, userAvatar, content } = req.body;
    const comment = new Comment({ postId, userId, userName, userAvatar, content });
    await comment.save();
    res.status(201).json({ status: 'success', data: comment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get comments for a post
const getComments = async (req, res) => {
  try {
    const { postId } = req.params;
    const comments = await Comment.find({ postId }).sort({ createdAt: -1 });
    res.json({ status: 'success', data: comments });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get feed — all posts (public feed, no follow filter needed for now)
const getFeed = async (req, res) => {
  try {
    const { followingIds, page = 1, limit = 30 } = req.body;
    // If followingIds provided and non-empty, show those + own posts; else show all
    const filter = { isReel: false };
    if (followingIds && followingIds.length > 0) {
      filter.userId = { $in: followingIds };
    }
    const posts = await Post.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ status: 'success', data: posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get explore posts (by hashtag or all)
const getExplore = async (req, res) => {
  try {
    const { hashtag } = req.query;
    const filter = hashtag ? { hashtags: hashtag } : {};
    const posts = await Post.find(filter).sort({ createdAt: -1 }).limit(30);
    res.json({ status: 'success', data: posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get reels
const getReels = async (req, res) => {
  try {
    const reels = await Post.find({ isReel: true }).sort({ createdAt: -1 }).limit(10);
    res.json({ status: 'success', data: reels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get posts by a specific user
const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const posts = await Post.find({ userId, isReel: false }).sort({ createdAt: -1 }).limit(20);
    res.json({ status: 'success', data: posts });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Toggle interest for events
const toggleInterest = async (req, res) => {
  try {
    const { postId, userId } = req.body;
    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    if (post.interested.includes(userId)) {
      post.interested = post.interested.filter(id => id !== userId);
    } else {
      post.interested.push(userId);
    }
    await post.save();
    res.json({ status: 'success', data: post });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createPost, likePost, toggleInterest, votePoll, addComment, getComments, getFeed, getExplore, getReels, getUserPosts };
