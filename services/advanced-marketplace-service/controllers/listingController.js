import AdvancedListing from '../models/AdvancedListing.js';
import Bid from '../models/Bid.js';

const createListing = async (req, res) => {
  try {
    const listing = new AdvancedListing(req.body);
    await listing.save();
    res.status(201).json({ status: 'success', data: listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getListings = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, condition, sort = 'newest', city, page = 1, limit = 20 } = req.query;
    const filter = { status: 'available' };
    
    if (category) filter.category = category;
    if (search) filter.$text = { $search: search };
    if (condition) filter.condition = condition;
    if (city) filter['location.city'] = new RegExp(city, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const sortMap = { newest: { createdAt: -1 }, price_low: { price: 1 }, price_high: { price: -1 }, popular: { viewCount: -1 } };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [listings, total] = await Promise.all([
      AdvancedListing.find(filter).sort(sortMap[sort] || sortMap.newest).skip(skip).limit(parseInt(limit)),
      AdvancedListing.countDocuments(filter)
    ]);
    res.json({ status: 'success', data: listings, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getListingDetails = async (req, res) => {
  try {
    const listing = await AdvancedListing.findByIdAndUpdate(req.params.id, { $inc: { viewCount: 1 } }, { new: true });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json({ status: 'success', data: listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateListing = async (req, res) => {
  try {
    const listing = await AdvancedListing.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ status: 'success', data: listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteListing = async (req, res) => {
  try {
    await AdvancedListing.findByIdAndUpdate(req.params.id, { status: 'removed' });
    res.json({ status: 'success', message: 'Listing removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const markAsSold = async (req, res) => {
  try {
    const { buyerId } = req.body;
    const listing = await AdvancedListing.findByIdAndUpdate(req.params.id, { status: 'sold', soldTo: buyerId, soldAt: new Date() }, { new: true });
    res.json({ status: 'success', data: listing });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSellerListings = async (req, res) => {
  try {
    const listings = await AdvancedListing.find({ sellerId: req.params.sellerId }).sort({ createdAt: -1 });
    res.json({ status: 'success', data: listings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const placeBid = async (req, res) => {
  try {
    const { listingId, bidderId, bidderName, amount, message } = req.body;
    const listing = await AdvancedListing.findById(listingId);
    if (!listing || !listing.isBiddable) return res.status(400).json({ error: 'Bidding not enabled' });
    if (amount <= (listing.currentBid || 0)) return res.status(400).json({ error: 'Bid must be higher than current bid' });

    const bid = new Bid({ listingId, bidderId, bidderName, amount, message });
    await bid.save();
    await AdvancedListing.findByIdAndUpdate(listingId, { currentBid: amount, $inc: { bidCount: 1 } });
    res.status(201).json({ status: 'success', data: bid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getBids = async (req, res) => {
  try {
    const bids = await Bid.find({ listingId: req.params.listingId }).sort({ amount: -1 });
    res.json({ status: 'success', data: bids });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const acceptBid = async (req, res) => {
  try {
    const bid = await Bid.findByIdAndUpdate(req.params.bidId, { status: 'accepted' }, { new: true });
    if (!bid) return res.status(404).json({ error: 'Bid not found' });
    await Bid.updateMany({ listingId: bid.listingId, _id: { $ne: bid._id } }, { status: 'rejected' });
    await AdvancedListing.findByIdAndUpdate(bid.listingId, { status: 'sold', price: bid.amount, soldTo: bid.bidderId, soldAt: new Date() });
    res.json({ status: 'success', data: bid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addToWishlist = async (req, res) => {
  try {
    const { userId } = req.body;
    await AdvancedListing.findByIdAndUpdate(req.params.id, { $addToSet: { wishlistedBy: userId } });
    res.json({ status: 'success', message: 'Added to wishlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const reportListing = async (req, res) => {
  try {
    const { userId, reason } = req.body;
    await AdvancedListing.findByIdAndUpdate(req.params.id, { $push: { reports: { userId, reason, createdAt: new Date() } } });
    res.json({ status: 'success', message: 'Listing reported' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createListing, getListings, getListingDetails, updateListing, deleteListing, markAsSold, getSellerListings, placeBid, getBids, acceptBid, addToWishlist, reportListing };
