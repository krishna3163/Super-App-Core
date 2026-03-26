import DatingProfile from '../models/DatingProfile.js';
import Match from '../models/Match.js';

export const getProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await DatingProfile.findOne({ userId });
    if (!profile) return res.status(404).json({ status: 'fail', message: 'Profile not found' });
    res.json({ status: 'success', data: profile });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const profile = await DatingProfile.findOneAndUpdate(
      { userId },
      req.body,
      { new: true, upsert: true }
    );
    res.json({ status: 'success', data: profile });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const swipe = async (req, res) => {
  try {
    const { userId, targetUserId, direction, action } = req.body; 
    const isLike = direction === 'right' || action === 'like';
    
    if (isLike) {
      // Check if target user already liked current user
      const existingMatch = await Match.findOne({
        users: { $all: [userId, targetUserId] },
        status: 'pending'
      });

      if (existingMatch && existingMatch.users[0] !== userId) {
        existingMatch.status = 'matched';
        await existingMatch.save();
        return res.json({ status: 'success', matched: true, message: 'It is a match!', data: existingMatch });
      } else {
        // Create a pending match if not already liked
        const alreadyLiked = await Match.findOne({ users: { $all: [userId, targetUserId] } });
        if (!alreadyLiked) {
          const newMatch = new Match({ users: [userId, targetUserId], status: 'pending' });
          await newMatch.save();
        }
        return res.json({ status: 'success', matched: false, message: 'Like recorded' });
      }
    }
    
    res.json({ status: 'success', matched: false, message: 'Swiped left' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getMatches = async (req, res) => {
  try {
    const { userId } = req.params;
    const matches = await Match.find({
      users: userId,
      status: 'matched'
    }).sort({ updatedAt: -1 });
    res.json({ status: 'success', data: matches });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getRandomProfiles = async (req, res) => {
  try {
    const profiles = await DatingProfile.aggregate([{ $sample: { size: 10 } }]);
    res.json({ status: 'success', data: profiles });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
