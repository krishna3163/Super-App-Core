import AdvancedListing from '../models/AdvancedListing.js';
import Bid from '../models/Bid.js';

const createListing = async (req, res) => {
  try {
    const listing = new AdvancedListing(req.body);
    await listing.save();
    res.status(201).json(listing);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getListings = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    const query = { status: 'available' };
    
    if (category) query.category = category;
    if (search) query.$text = { $search: search };
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const listings = await AdvancedListing.find(query).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const placeBid = async (req, res) => {
  try {
    const { listingId, bidderId, amount } = req.body;
    const listing = await AdvancedListing.findById(listingId);
    if (!listing.isBiddable) return res.status(400).json({ error: 'Bidding not enabled for this listing' });

    const bid = new Bid({ listingId, bidderId, amount });
    await bid.save();
    res.status(201).json(bid);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getBids = async (req, res) => {
  try {
    const bids = await Bid.find({ listingId: req.params.listingId }).sort({ amount: -1 });
    res.json(bids);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createListing, getListings, placeBid, getBids };
