import AdvancedProfile from '../models/AdvancedProfile.js';
import Follower from '../models/Follower.js';
import QRCode from 'qrcode';

// Get or Create Profile
export const updateProfile = async (req, res) => {
  try {
    const { userId, username, avatar, bio, location, website, profileMarkdown, isPublic, whoCanView } = req.body;
    
    // Generate uniqueId if new
    let profile = await AdvancedProfile.findOne({ userId });
    if (!profile) {
      const uniqueId = `user_${Math.floor(Math.random() * 100000)}`;
      profile = new AdvancedProfile({ userId, username, uniqueId });
    }

    if (username) profile.username = username;
    if (avatar) profile.avatar = avatar;
    if (bio) profile.bio = bio;
    if (location) profile.location = location;
    if (website) profile.website = website;
    if (profileMarkdown) profile.profileMarkdown = profileMarkdown;
    if (isPublic !== undefined) profile.isPublic = isPublic;
    if (whoCanView) profile.whoCanView = whoCanView;

    await profile.save();
    res.json(profile);
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ error: 'Username already taken' });
    res.status(500).json({ error: err.message });
  }
};

export const getProfileByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const profile = await AdvancedProfile.findOne({ username });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    // Increment profile views
    profile.profileViews += 1;
    await profile.save();

    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const toggleFollow = async (req, res) => {
  try {
    const { followerId, followingId } = req.body;
    
    const existing = await Follower.findOne({ followerId, followingId });
    if (existing) {
      // Unfollow
      await Follower.findByIdAndDelete(existing._id);
      await AdvancedProfile.findOneAndUpdate({ userId: followerId }, { $inc: { followingCount: -1 } });
      await AdvancedProfile.findOneAndUpdate({ userId: followingId }, { $inc: { followersCount: -1 } });
      res.json({ message: 'Unfollowed successfully', isFollowing: false });
    } else {
      // Follow
      const follow = new Follower({ followerId, followingId });
      await follow.save();
      await AdvancedProfile.findOneAndUpdate({ userId: followerId }, { $inc: { followingCount: 1 } });
      await AdvancedProfile.findOneAndUpdate({ userId: followingId }, { $inc: { followersCount: 1 } });
      
      // Check if mutual (Connection)
      const mutual = await Follower.findOne({ followerId: followingId, followingId: followerId });
      if (mutual) {
        await AdvancedProfile.updateMany(
          { userId: { $in: [followerId, followingId] } },
          { $inc: { connectionsCount: 1 } }
        );
      }
      res.json({ message: 'Followed successfully', isFollowing: true });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchProfiles = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const profiles = await AdvancedProfile.find({ $text: { $search: q } }).limit(20);
    res.json(profiles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const generateProfileQR = async (req, res) => {
  try {
    const { username } = req.params;
    const url = `${process.env.FRONTEND_URL}/u/${username}`;
    const qrCodeDataUrl = await QRCode.toDataURL(url);
    res.json({ qrCode: qrCodeDataUrl, url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const followers = await Follower.find({ followingId: userId });
    res.json(followers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const following = await Follower.find({ followerId: userId });
    res.json(following);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
