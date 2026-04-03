import HotelReview from '../models/Review.js';
import Hotel from '../models/Hotel.js';
import Wishlist from '../models/Wishlist.js';

// ==================== REVIEWS ====================
export const addReview = async (req, res) => {
  try {
    const { hotelId, userId, userName, rating, title, comment, pros, cons, photos, categories, travelType, stayDate, bookingId } = req.body;
    
    const existing = await HotelReview.findOne({ hotelId, userId });
    if (existing) return res.status(400).json({ error: 'You already reviewed this hotel' });

    const review = new HotelReview({ hotelId, userId, userName, rating, title, comment, pros, cons, photos, categories, travelType, stayDate, bookingId, isVerified: !!bookingId });
    await review.save();

    // Update hotel rating
    const allReviews = await HotelReview.find({ hotelId, status: 'active' });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
    await Hotel.findByIdAndUpdate(hotelId, { rating: Math.round(avgRating * 10) / 10, reviewCount: allReviews.length });

    res.status(201).json({ status: 'success', data: review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getHotelReviews = async (req, res) => {
  try {
    const { hotelId } = req.params;
    const { sort = 'recent', rating, travelType, page = 1, limit = 10 } = req.query;
    
    const filter = { hotelId, status: 'active' };
    if (rating) filter.rating = parseInt(rating);
    if (travelType) filter.travelType = travelType;

    const sortMap = { recent: { createdAt: -1 }, highest: { rating: -1 }, lowest: { rating: 1 }, helpful: { helpful: -1 } };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [reviews, total] = await Promise.all([
      HotelReview.find(filter).sort(sortMap[sort] || sortMap.recent).skip(skip).limit(parseInt(limit)),
      HotelReview.countDocuments(filter)
    ]);

    // Calculate rating distribution
    const distribution = await HotelReview.aggregate([
      { $match: { hotelId: reviews[0]?.hotelId || hotelId, status: 'active' } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    // Category averages
    const categoryAvg = await HotelReview.aggregate([
      { $match: { hotelId: reviews[0]?.hotelId || hotelId, status: 'active' } },
      { $group: {
        _id: null,
        cleanliness: { $avg: '$categories.cleanliness' },
        service: { $avg: '$categories.service' },
        location: { $avg: '$categories.location' },
        value: { $avg: '$categories.value' },
        amenities: { $avg: '$categories.amenities' }
      }}
    ]);

    res.json({ 
      status: 'success', 
      data: reviews, 
      distribution: distribution.reduce((acc, d) => { acc[d._id] = d.count; return acc; }, {}),
      categoryAverages: categoryAvg[0] || {},
      pagination: { page: parseInt(page), limit: parseInt(limit), total }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const likeReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { userId } = req.body;
    const review = await HotelReview.findById(reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    const idx = review.likes.indexOf(userId);
    if (idx > -1) {
      review.likes.splice(idx, 1);
      review.helpful = Math.max(0, review.helpful - 1);
    } else {
      review.likes.push(userId);
      review.helpful += 1;
    }
    await review.save();
    res.json({ status: 'success', data: review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const ownerReplyToReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { message } = req.body;
    const review = await HotelReview.findByIdAndUpdate(
      reviewId,
      { ownerReply: { message, repliedAt: new Date() } },
      { new: true }
    );
    res.json({ status: 'success', data: review });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ==================== WISHLIST ====================
export const addToWishlist = async (req, res) => {
  try {
    const { userId, hotelId, notes, plannedCheckIn, plannedCheckOut, priceAlert, targetPrice } = req.body;
    const item = await Wishlist.findOneAndUpdate(
      { userId, hotelId },
      { notes, plannedCheckIn, plannedCheckOut, priceAlert, targetPrice },
      { upsert: true, new: true }
    );
    res.status(201).json({ status: 'success', data: item });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getWishlist = async (req, res) => {
  try {
    const { userId } = req.params;
    const wishlist = await Wishlist.find({ userId }).populate('hotelId').sort({ createdAt: -1 });
    res.json({ status: 'success', data: wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const removeFromWishlist = async (req, res) => {
  try {
    await Wishlist.findByIdAndDelete(req.params.itemId);
    res.json({ status: 'success', message: 'Removed from wishlist' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
