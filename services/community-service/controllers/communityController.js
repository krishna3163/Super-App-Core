import Community from '../models/Community.js';
import CommunityPost from '../models/CommunityPost.js';

export const createCommunity = async (req, res) => {
  try {
    const { name, displayName, description, creatorId, category, tags, rules, icon, banner } = req.body;
    const community = new Community({
      name: name.toLowerCase().replace(/\s+/g, '_'),
      displayName: displayName || name,
      description, creatorId, category, tags, rules, icon, banner,
      members: [creatorId],
      moderators: [{ userId: creatorId }],
      memberCount: 1
    });
    await community.save();
    res.status(201).json({ status: 'success', data: community });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const joinCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { userId } = req.body;
    const community = await Community.findById(communityId);
    if (!community) return res.status(404).json({ status: 'fail', message: 'Community not found' });
    if (community.bannedUsers.some(b => b.userId === userId)) return res.status(403).json({ error: 'You are banned from this community' });

    if (!community.members.includes(userId)) {
      community.members.push(userId);
      community.memberCount += 1;
      await community.save();
    }
    res.json({ status: 'success', data: community });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const leaveCommunity = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { userId } = req.body;
    const community = await Community.findById(communityId);
    if (community.creatorId === userId) return res.status(400).json({ error: 'Creator cannot leave' });
    community.members = community.members.filter(m => m !== userId);
    community.memberCount = Math.max(0, community.memberCount - 1);
    await community.save();
    res.json({ status: 'success', message: 'Left community' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const post = new CommunityPost(req.body);
    await post.save();
    res.status(201).json({ status: 'success', data: post });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getCommunityPosts = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { sort = 'hot', flair, page = 1, limit = 25 } = req.query;
    const filter = { communityId, isRemoved: false };
    if (flair) filter['flair.name'] = flair;

    const sortMap = { hot: { score: -1, createdAt: -1 }, new: { createdAt: -1 }, top: { score: -1 }, controversial: { commentCount: -1 } };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      CommunityPost.find(filter).sort(sortMap[sort] || sortMap.hot).skip(skip).limit(parseInt(limit)),
      CommunityPost.countDocuments(filter)
    ]);
    res.json({ status: 'success', data: posts, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const votePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, vote } = req.body; // vote: 'up' | 'down' | 'none'
    const post = await CommunityPost.findById(postId);
    if (!post) return res.status(404).json({ error: 'Post not found' });

    post.upvotes = post.upvotes.filter(u => u !== userId);
    post.downvotes = post.downvotes.filter(u => u !== userId);
    if (vote === 'up') post.upvotes.push(userId);
    else if (vote === 'down') post.downvotes.push(userId);
    post.score = post.upvotes.length - post.downvotes.length;
    await post.save();
    res.json({ status: 'success', data: { score: post.score, upvotes: post.upvotes.length, downvotes: post.downvotes.length } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const votePoll = async (req, res) => {
  try {
    const { postId } = req.params;
    const { userId, optionIndex } = req.body;
    const post = await CommunityPost.findById(postId);
    if (!post || !post.poll) return res.status(400).json({ error: 'Not a poll post' });
    if (post.poll.endsAt && post.poll.endsAt < new Date()) return res.status(400).json({ error: 'Poll has ended' });

    // Remove existing vote
    post.poll.options.forEach(opt => { opt.votes = opt.votes.filter(v => v !== userId); });
    // Add new vote
    if (post.poll.options[optionIndex]) {
      post.poll.options[optionIndex].votes.push(userId);
    }
    post.poll.totalVotes = post.poll.options.reduce((sum, opt) => sum + opt.votes.length, 0);
    await post.save();
    res.json({ status: 'success', data: post.poll });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const listCommunities = async (req, res) => {
  try {
    const { category, q, sort = 'members', page = 1, limit = 20 } = req.query;
    const filter = { isPublic: true };
    if (category) filter.category = category;
    if (q) filter.$text = { $search: q };

    const sortMap = { members: { memberCount: -1 }, newest: { createdAt: -1 }, name: { name: 1 } };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const communities = await Community.find(filter).sort(sortMap[sort] || sortMap.members).skip(skip).limit(parseInt(limit));
    res.json({ status: 'success', data: communities });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getCommunityDetails = async (req, res) => {
  try {
    const community = await Community.findById(req.params.communityId);
    if (!community) return res.status(404).json({ error: 'Community not found' });
    res.json({ status: 'success', data: community });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getUserCommunities = async (req, res) => {
  try {
    const communities = await Community.find({ members: req.params.userId }).sort({ memberCount: -1 });
    res.json({ status: 'success', data: communities });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Moderation
export const removePost = async (req, res) => {
  try {
    const { reason } = req.body;
    await CommunityPost.findByIdAndUpdate(req.params.postId, { isRemoved: true, removedReason: reason });
    res.json({ status: 'success', message: 'Post removed' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const banUser = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    const community = await Community.findById(req.params.communityId);
    community.bannedUsers.push({ userId, reason, bannedAt: new Date() });
    community.members = community.members.filter(m => m !== userId);
    community.memberCount = Math.max(0, community.memberCount - 1);
    await community.save();
    res.json({ status: 'success', message: 'User banned' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const reportPost = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    await CommunityPost.findByIdAndUpdate(req.params.postId, { $push: { reports: { userId, reason, createdAt: new Date() } } });
    res.json({ status: 'success', message: 'Post reported' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const pinPost = async (req, res) => {
  try {
    const post = await CommunityPost.findByIdAndUpdate(req.params.postId, { isPinned: true }, { new: true });
    res.json({ status: 'success', data: post });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
