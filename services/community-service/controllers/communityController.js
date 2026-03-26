import Community from '../models/Community.js';
import CommunityPost from '../models/CommunityPost.js';

export const createCommunity = async (req, res) => {
  try {
    const { name, description, creatorId, tags } = req.body;
    const community = new Community({
      name,
      description,
      creatorId,
      members: [creatorId],
      tags
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
    const community = await Community.findByIdAndUpdate(
      communityId,
      { $addToSet: { members: userId } },
      { new: true }
    );
    if (!community) return res.status(404).json({ status: 'fail', message: 'Community not found' });
    res.json({ status: 'success', data: community });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const createPost = async (req, res) => {
  try {
    const { communityId, userId, content, media } = req.body;
    const post = new CommunityPost({ communityId, userId, content, media });
    await post.save();
    res.status(201).json({ status: 'success', data: post });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getCommunityPosts = async (req, res) => {
  try {
    const { communityId } = req.params;
    const posts = await CommunityPost.find({ communityId }).sort({ createdAt: -1 });
    res.json({ status: 'success', data: posts });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const listCommunities = async (req, res) => {
  try {
    const communities = await Community.find().limit(20);
    res.json({ status: 'success', data: communities });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
