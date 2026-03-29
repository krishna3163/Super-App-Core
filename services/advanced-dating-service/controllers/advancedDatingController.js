import AdvancedDatingProfile from '../models/AdvancedDatingProfile.js';
import AdvancedSwipe from '../models/AdvancedSwipe.js';
import DatingSafety from '../models/DatingSafety.js';

const updateProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    let profile = await AdvancedDatingProfile.findOne({ userId });
    if (!profile) {
      profile = new AdvancedDatingProfile(req.body);
    } else {
      Object.assign(profile, req.body);
    }
    await profile.save();
    res.json({ status: 'success', data: profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const profile = await AdvancedDatingProfile.findOne({ userId: req.params.userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    res.json({ status: 'success', data: profile });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const swipe = async (req, res) => {
  try {
    const { swiperId, swipedId, type } = req.body;
    
    if (type === 'super_like') {
      const swiper = await AdvancedDatingProfile.findOne({ userId: swiperId });
      if (swiper.superLikeCount <= 0 && !swiper.isPremium) {
        return res.status(403).json({ error: 'No super likes remaining' });
      }
      swiper.superLikeCount -= 1;
      await swiper.save();
    }

    const newSwipe = new AdvancedSwipe({ swiperId, swipedId, type });
    await newSwipe.save();

    let isMatch = false;
    if (type === 'like' || type === 'super_like') {
      const mutualLike = await AdvancedSwipe.findOne({ 
        swiperId: swipedId, swipedId: swiperId, type: { $in: ['like', 'super_like'] } 
      });
      if (mutualLike) {
        isMatch = true;
        // Update match arrays on both profiles
        await AdvancedDatingProfile.findOneAndUpdate({ userId: swiperId }, { $addToSet: { matches: swipedId } });
        await AdvancedDatingProfile.findOneAndUpdate({ userId: swipedId }, { $addToSet: { matches: swiperId } });
      }
    }

    res.json({ status: 'success', data: { isMatch, swipeType: type } });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Already swiped' });
    res.status(500).json({ error: err.message });
  }
};

const rewindSwipe = async (req, res) => {
  try {
    const { userId } = req.body;
    const profile = await AdvancedDatingProfile.findOne({ userId });
    if (!profile.isPremium) return res.status(403).json({ error: 'Premium feature only' });

    const lastSwipe = await AdvancedSwipe.findOne({ swiperId: userId }).sort({ createdAt: -1 });
    if (!lastSwipe) return res.status(404).json({ error: 'No swipes to rewind' });
    
    await AdvancedSwipe.findByIdAndDelete(lastSwipe._id);
    res.json({ status: 'success', message: 'Swipe rewound' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const boostProfile = async (req, res) => {
  try {
    const { userId, duration = 30 } = req.body;
    const boostDuration = duration * 60 * 1000;
    const boostedUntil = new Date(Date.now() + boostDuration);
    await AdvancedDatingProfile.findOneAndUpdate({ userId }, { boostedUntil, $inc: { boostCount: 1 } });
    res.json({ status: 'success', data: { boostedUntil } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCompatibility = (p1, p2) => {
  if (!p1.interests.length || !p2.interests.length) return 50;
  const commonInterests = p1.interests.filter(i => p2.interests.includes(i));
  return Math.round((commonInterests.length / Math.max(p1.interests.length, p2.interests.length)) * 100);
};

const getFeed = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const currentUser = await AdvancedDatingProfile.findOne({ userId });
    if (!currentUser) return res.status(404).json({ error: 'Create dating profile first' });
    
    const swipedIds = (await AdvancedSwipe.find({ swiperId: userId })).map(s => s.swipedId);
    swipedIds.push(userId);

    const filter = { userId: { $nin: swipedIds }, isActive: true };
    if (currentUser.interestedIn !== 'everyone') filter.gender = currentUser.interestedIn;
    if (currentUser.preferences?.ageRange) {
      filter.age = { $gte: currentUser.preferences.ageRange.min, $lte: currentUser.preferences.ageRange.max };
    }

    // Prioritize boosted profiles
    const potentialMatches = await AdvancedDatingProfile.find(filter)
      .sort({ boostedUntil: -1, createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit));

    const feedWithScores = potentialMatches.map(p => ({
      ...p.toObject(),
      compatibilityScore: getCompatibility(currentUser, p),
      isBoosted: p.boostedUntil && p.boostedUntil > new Date()
    })).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json({ status: 'success', data: feedWithScores });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getMatches = async (req, res) => {
  try {
    const { userId } = req.params;
    const profile = await AdvancedDatingProfile.findOne({ userId });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const matchProfiles = await AdvancedDatingProfile.find({ userId: { $in: profile.matches || [] } });
    res.json({ status: 'success', data: matchProfiles });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getLikedMe = async (req, res) => {
  try {
    const { userId } = req.params;
    const likes = await AdvancedSwipe.find({ swipedId: userId, type: { $in: ['like', 'super_like'] } });
    const likerIds = likes.map(l => l.swiperId);
    
    // Only premium users can see who liked them fully
    const profile = await AdvancedDatingProfile.findOne({ userId });
    if (!profile?.isPremium) {
      return res.json({ status: 'success', data: { count: likerIds.length, profiles: [] }, isPremiumRequired: true });
    }

    const profiles = await AdvancedDatingProfile.find({ userId: { $in: likerIds } });
    res.json({ status: 'success', data: { count: likerIds.length, profiles } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const unmatch = async (req, res) => {
  try {
    const { userId, matchedUserId } = req.body;
    await AdvancedDatingProfile.findOneAndUpdate({ userId }, { $pull: { matches: matchedUserId } });
    await AdvancedDatingProfile.findOneAndUpdate({ userId: matchedUserId }, { $pull: { matches: userId } });
    res.json({ status: 'success', message: 'Unmatched' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const reportUser = async (req, res) => {
  try {
    const report = new DatingSafety(req.body);
    await report.save();
    res.json({ status: 'success', message: 'Report submitted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const scheduleDateSpot = async (req, res) => {
  try {
    const { userId, matchId, venue, dateTime, note } = req.body;
    // In real app, this would create a calendar event and notify the match
    res.json({ status: 'success', data: { venue, dateTime, note, status: 'proposed', proposedBy: userId, proposedTo: matchId } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { updateProfile, getProfile, swipe, rewindSwipe, boostProfile, getFeed, getMatches, getLikedMe, unmatch, reportUser, scheduleDateSpot };
