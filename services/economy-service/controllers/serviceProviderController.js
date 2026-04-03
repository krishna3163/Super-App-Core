import ServiceProvider from '../models/ServiceProvider.js';

// Register/update provider profile
export const upsertProfile = async (req, res) => {
  try {
    const { userId } = req.body;
    const provider = await ServiceProvider.findOneAndUpdate(
      { userId },
      { ...req.body, lastActive: new Date() },
      { upsert: true, new: true }
    );
    res.json({ status: 'success', data: provider });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get provider profile
export const getProfile = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.params.userId });
    if (!provider) return res.status(404).json({ error: 'Provider not found' });
    res.json({ status: 'success', data: provider });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search providers
export const searchProviders = async (req, res) => {
  try {
    const { skill, level, city, sort = 'rating', page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };
    if (skill) filter.skills = { $in: [new RegExp(skill, 'i')] };
    if (level) filter.level = level;
    if (city) filter['location.city'] = new RegExp(city, 'i');

    const sortMap = { rating: { rating: -1 }, gigs: { completedGigs: -1 }, newest: { memberSince: -1 } };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [providers, total] = await Promise.all([
      ServiceProvider.find(filter).sort(sortMap[sort] || sortMap.rating).skip(skip).limit(parseInt(limit)),
      ServiceProvider.countDocuments(filter)
    ]);
    res.json({ status: 'success', data: providers, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get top providers
export const getTopProviders = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isActive: true, level: { $in: ['top_rated', 'pro'] } };
    const providers = await ServiceProvider.find(filter).sort({ rating: -1, completedGigs: -1 }).limit(10);
    res.json({ status: 'success', data: providers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update online status
export const updateOnlineStatus = async (req, res) => {
  try {
    const { userId, isOnline } = req.body;
    await ServiceProvider.findOneAndUpdate({ userId }, { isOnline, lastActive: new Date() });
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get provider earnings summary
export const getEarnings = async (req, res) => {
  try {
    const provider = await ServiceProvider.findOne({ userId: req.params.userId });
    if (!provider) return res.status(404).json({ error: 'Provider not found' });
    res.json({ status: 'success', data: {
      totalEarnings: provider.totalEarnings,
      completedGigs: provider.completedGigs,
      rating: provider.rating,
      level: provider.level,
      onTimeDelivery: provider.onTimeDelivery
    }});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
