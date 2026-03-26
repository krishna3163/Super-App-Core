import AdvancedDatingProfile from '../models/AdvancedDatingProfile.js';
import AdvancedSwipe from '../models/AdvancedSwipe.js';

const updateProfile = async (req, res) => {
  try {
    const { userId, name, age, gender, interestedIn, bio, prompts, interests, photos, location } = req.body;
    let profile = await AdvancedDatingProfile.findOne({ userId });
    
    if (!profile) {
      profile = new AdvancedDatingProfile({ userId, name, age, gender, interestedIn, bio, prompts, interests, photos, location });
    } else {
      profile.name = name || profile.name;
      profile.age = age || profile.age;
      profile.gender = gender || profile.gender;
      profile.interestedIn = interestedIn || profile.interestedIn;
      profile.bio = bio || profile.bio;
      profile.prompts = prompts || profile.prompts;
      profile.interests = interests || profile.interests;
      profile.photos = photos || profile.photos;
      if (location) profile.location = location;
    }
    
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const swipe = async (req, res) => {
  try {
    const { swiperId, swipedId, type } = req.body; // 'like', 'pass', 'super_like'
    
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
        swiperId: swipedId, 
        swipedId: swiperId, 
        type: { $in: ['like', 'super_like'] } 
      });
      if (mutualLike) isMatch = true;
    }

    res.json({ success: true, isMatch });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Already swiped' });
    res.status(500).json({ error: err.message });
  }
};

const rewindSwipe = async (req, res) => {
  try {
    const { userId } = req.body;
    const lastSwipe = await AdvancedSwipe.findOne({ swiperId: userId }).sort({ createdAt: -1 });
    if (!lastSwipe) return res.status(404).json({ error: 'No swipes to rewind' });
    
    await AdvancedSwipe.findByIdAndDelete(lastSwipe._id);
    res.json({ success: true, message: 'Swipe rewound' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const boostProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const boostDuration = 30 * 60 * 1000; // 30 minutes
    const boostedUntil = new Date(Date.now() + boostDuration);
    
    await AdvancedDatingProfile.findOneAndUpdate({ userId }, { boostedUntil });
    res.json({ success: true, boostedUntil });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getCompatibility = (p1, p2) => {
  const commonInterests = p1.interests.filter(i => p2.interests.includes(i));
  return (commonInterests.length / Math.max(p1.interests.length, p2.interests.length)) * 100;
};

const getFeed = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUser = await AdvancedDatingProfile.findOne({ userId });
    
    const swipedIds = (await AdvancedSwipe.find({ swiperId: userId })).map(s => s.swipedId);
    swipedIds.push(userId);

    const potentialMatches = await AdvancedDatingProfile.find({
      userId: { $nin: swipedIds },
      gender: currentUser.interestedIn === 'everyone' ? { $exists: true } : currentUser.interestedIn
    }).limit(20);

    const feedWithScores = potentialMatches.map(p => ({
      ...p.toObject(),
      compatibilityScore: getCompatibility(currentUser, p)
    })).sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    res.json(feedWithScores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { updateProfile, swipe, rewindSwipe, boostProfile, getFeed };
