import Gig from '../models/Gig.js';
import ServiceProvider from '../models/ServiceProvider.js';

// Create a gig
export const createGig = async (req, res) => {
  try {
    const gig = new Gig(req.body);
    await gig.save();
    res.status(201).json({ status: 'success', data: gig });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update a gig
export const updateGig = async (req, res) => {
  try {
    const gig = await Gig.findByIdAndUpdate(req.params.gigId, req.body, { new: true });
    if (!gig) return res.status(404).json({ error: 'Gig not found' });
    res.json({ status: 'success', data: gig });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Search gigs
export const searchGigs = async (req, res) => {
  try {
    const { q, category, subcategory, minPrice, maxPrice, deliveryDays, sort = 'recommended', page = 1, limit = 20 } = req.query;
    const filter = { isActive: true, status: 'active' };

    if (q) filter.$text = { $search: q };
    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (minPrice || maxPrice) {
      filter['packages.price'] = {};
      if (minPrice) filter['packages.price'].$gte = parseInt(minPrice);
      if (maxPrice) filter['packages.price'].$lte = parseInt(maxPrice);
    }
    if (deliveryDays) filter['packages.deliveryDays'] = { $lte: parseInt(deliveryDays) };

    const sortMap = {
      recommended: { rating: -1, ordersCompleted: -1 },
      newest: { createdAt: -1 },
      rating: { rating: -1 },
      price_low: { 'packages.0.price': 1 },
      price_high: { 'packages.0.price': -1 },
      popular: { ordersCompleted: -1 }
    };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [gigs, total] = await Promise.all([
      Gig.find(filter).sort(sortMap[sort] || sortMap.recommended).skip(skip).limit(parseInt(limit)),
      Gig.countDocuments(filter)
    ]);

    res.json({ status: 'success', data: gigs, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get gig details
export const getGigDetails = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) return res.status(404).json({ error: 'Gig not found' });
    
    // Increment impressions
    gig.impressions += 1;
    await gig.save();

    const provider = await ServiceProvider.findOne({ userId: gig.providerId });
    res.json({ status: 'success', data: { gig, provider } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get provider's gigs
export const getProviderGigs = async (req, res) => {
  try {
    const gigs = await Gig.find({ providerId: req.params.providerId }).sort({ createdAt: -1 });
    res.json({ status: 'success', data: gigs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get featured gigs
export const getFeaturedGigs = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { isFeatured: true, isActive: true, status: 'active' };
    if (category) filter.category = category;
    const gigs = await Gig.find(filter).sort({ rating: -1 }).limit(12);
    res.json({ status: 'success', data: gigs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get categories with counts
export const getCategories = async (req, res) => {
  try {
    const categories = await Gig.aggregate([
      { $match: { isActive: true, status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 }, avgRating: { $avg: '$rating' } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ status: 'success', data: categories });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete gig (soft delete)
export const deleteGig = async (req, res) => {
  try {
    await Gig.findByIdAndUpdate(req.params.gigId, { isActive: false, status: 'paused' });
    res.json({ status: 'success', message: 'Gig deactivated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
