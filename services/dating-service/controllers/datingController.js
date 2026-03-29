import DatingProfile from '../models/DatingProfile.js';
import Match from '../models/Match.js';
import Swipe from '../models/Swipe.js';
import BlindDateMatch from '../models/BlindDateMatch.js';
import axios from 'axios';

// --- Blind Date Matching Logic ---
let blindDateQueue = [];

export const joinBlindDateQueue = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ status: 'fail', message: 'userId is required' });
    }

    const existingMatch = await BlindDateMatch.findOne({
      status: 'active',
      expiresAt: { $gt: new Date() },
      'participants.userId': userId
    }).sort({ createdAt: -1 });

    if (existingMatch) {
      return res.json({ status: 'success', matched: true, data: existingMatch });
    }
    
    // Check if already in queue
    if (blindDateQueue.some(u => u.userId === userId)) {
      return res.json({ status: 'success', matched: false, message: 'Waiting for a partner...' });
    }

    // Check if another user is waiting
    if (blindDateQueue.length > 0) {
      const partner = blindDateQueue.shift();
      const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes duration
      
      const blindMatch = new BlindDateMatch({
        participants: [
          { userId, tempNickname: 'ShadowUser1' },
          { userId: partner.userId, tempNickname: 'ShadowUser2' }
        ],
        expiresAt
      });

      // Create temporary chat in chat-service
      try {
        const chatRes = await axios.post(`${process.env.CHAT_SERVICE_URL}/chats`, {
          userId,
          targetUserId: partner.userId,
          isAnonymous: true
        }, { headers: { 'X-User-Id': userId } });
        
        blindMatch.chatId = chatRes.data._id;
      } catch (chatErr) {
        console.error('Failed to create blind chat:', chatErr.message);
      }

      await blindMatch.save();
      return res.status(201).json({ status: 'success', matched: true, data: blindMatch });
    } else {
      blindDateQueue.push({ userId, joinedAt: new Date() });
      res.json({ status: 'success', matched: false, message: 'Waiting for a partner...' });
    }
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const revealIdentity = async (req, res) => {
  try {
    const { userId, matchId } = req.body;
    const match = await BlindDateMatch.findById(matchId);
    if (!match) return res.status(404).json({ status: 'fail', message: 'Match not found' });

    const userInMatch = match.participants.find(p => p.userId === userId);
    if (!userInMatch) return res.status(403).json({ status: 'fail', message: 'Not part of this match' });

    userInMatch.isRevealed = true;
    
    // If both revealed, change status to revealed
    if (match.participants.every(p => p.isRevealed)) {
      match.status = 'revealed';
      
      // Optionally create a permanent Match record
      const p1 = match.participants[0].userId;
      const p2 = match.participants[1].userId;
      const permanentMatch = new Match({ users: [p1, p2], status: 'matched' });
      await permanentMatch.save();
    }

    await match.save();
    res.json({ status: 'success', data: match });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// Helper to calculate compatibility (for feed sorting)
const getCompatibility = (p1, p2) => {
  if (!p1.interests || !p2.interests) return 0;
  const commonInterests = p1.interests.filter(i => p2.interests.includes(i));
  return (commonInterests.length / Math.max(p1.interests.length, p2.interests.length)) * 100;
};

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
      { ...req.body },
      { new: true, upsert: true }
    );
    res.json({ status: 'success', data: profile });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const swipe = async (req, res) => {
  try {
    const { userId, targetUserId, action, type } = req.body; 
    const swipeType = type || (action === 'like' ? 'like' : 'pass');
    
    // Check if profile exists
    const swiper = await DatingProfile.findOne({ userId });
    if (!swiper) return res.status(404).json({ status: 'fail', message: 'Your profile is not set up' });

    // Handle Super Like count
    if (swipeType === 'super_like') {
      if (swiper.superLikeCount <= 0 && !swiper.isPremium) {
        return res.status(403).json({ status: 'fail', message: 'No super likes remaining' });
      }
      swiper.superLikeCount -= 1;
      await swiper.save();
    }

    // Record the swipe
    const newSwipe = new Swipe({ swiperId: userId, swipedId: targetUserId, type: swipeType });
    await newSwipe.save();

    let isMatch = false;
    if (swipeType === 'like' || swipeType === 'super_like') {
      // Check for mutual like
      const mutualSwipe = await Swipe.findOne({
        swiperId: targetUserId,
        swipedId: userId,
        type: { $in: ['like', 'super_like'] }
      });

      if (mutualSwipe) {
        isMatch = true;
        // Create match record
        const match = new Match({ users: [userId, targetUserId], status: 'matched' });
        await match.save();

        // --- AUTOMATION: Create Chat ---
        try {
           await axios.post(`${process.env.CHAT_SERVICE_URL}/chats`, {
             userId: userId,
             targetUserId: targetUserId
           }, { headers: { 'X-User-Id': userId } });
        } catch (chatErr) {
          console.error('Failed to create match chat:', chatErr.message);
        }

        // --- AUTOMATION: Send Notification ---
        try {
          await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notify`, {
            userId: targetUserId,
            title: "It's a Match!",
            message: `You matched with ${swiper.name}! Start chatting now.`,
            type: 'dating_match',
            data: { matchId: match._id, userId: userId }
          });
        } catch (notifErr) {
          console.error('Failed to send match notification:', notifErr.message);
        }
      }
    }
    
    res.json({ status: 'success', matched: isMatch, message: isMatch ? 'It is a match!' : 'Swipe recorded' });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ status: 'fail', message: 'Already swiped' });
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const rewindSwipe = async (req, res) => {
  try {
    const { userId } = req.body;
    const lastSwipe = await Swipe.findOne({ swiperId: userId }).sort({ createdAt: -1 });
    if (!lastSwipe) return res.status(404).json({ status: 'fail', message: 'No swipes to rewind' });
    
    // Check if it resulted in a match, maybe remove match if so? (Optional)
    if (lastSwipe.type !== 'pass') {
       await Match.findOneAndDelete({ users: { $all: [userId, lastSwipe.swipedId] } });
    }

    await Swipe.findByIdAndDelete(lastSwipe._id);
    res.json({ status: 'success', message: 'Swipe rewound' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const boostProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const boostDuration = 30 * 60 * 1000; // 30 minutes
    const boostedUntil = new Date(Date.now() + boostDuration);
    
    await DatingProfile.findOneAndUpdate({ userId }, { boostedUntil });
    res.json({ status: 'success', boostedUntil });
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

    // Populate other user profiles
    const populatedMatches = await Promise.all(matches.map(async (m) => {
      const otherUserId = m.users.find(id => id !== userId);
      const profile = await DatingProfile.findOne({ userId: otherUserId });
      return {
        ...m.toObject(),
        profile: profile || { name: 'Unknown User', photos: [] }
      };
    }));

    res.json({ status: 'success', data: populatedMatches });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

export const getRandomProfiles = async (req, res) => {
  try {
    const { userId } = req.query; // Passed as query param or from auth header (via gateway)
    const requesterId = userId || req.headers['x-user-id'];

    if (!requesterId) {
      // Fallback: just return random profiles if no user specified
      const profiles = await DatingProfile.aggregate([{ $sample: { size: 10 } }]);
      return res.json({ status: 'success', data: profiles });
    }

    const currentUser = await DatingProfile.findOne({ userId: requesterId });
    if (!currentUser) {
      // If profile doesn't exist, just return some random ones but ideally user should set up profile first
      const profiles = await DatingProfile.aggregate([{ $sample: { size: 10 } }]);
      return res.json({ status: 'success', data: profiles });
    }

    // Get IDs of users already swiped
    const swipedIds = (await Swipe.find({ swiperId: requesterId })).map(s => s.swipedId);
    swipedIds.push(requesterId);

    // Build query based on preferences
    const query = {
      userId: { $nin: swipedIds },
      age: { $gte: currentUser.preferences.minAge, $lte: currentUser.preferences.maxAge }
    };

    if (currentUser.interestedIn !== 'everyone') {
      query.gender = currentUser.interestedIn;
    }

    // Location filtering
    if (currentUser.location && currentUser.location.coordinates) {
      query.location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: currentUser.location.coordinates
          },
          $maxDistance: currentUser.preferences.maxDistance * 1000 // Convert km to meters
        }
      };
    }

    const potentialMatches = await DatingProfile.find(query).limit(50);

    // Sort by compatibility and boost status
    const feed = potentialMatches.map(p => ({
      ...p.toObject(),
      compatibilityScore: getCompatibility(currentUser, p),
      isBoosted: p.boostedUntil && p.boostedUntil > new Date()
    })).sort((a, b) => {
      if (a.isBoosted && !b.isBoosted) return -1;
      if (!a.isBoosted && b.isBoosted) return 1;
      return b.compatibilityScore - a.compatibilityScore;
    });

    res.json({ status: 'success', data: feed.slice(0, 15) });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
