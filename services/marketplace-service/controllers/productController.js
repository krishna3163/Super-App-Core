import Product from '../models/Product.js';
import Review from '../models/Review.js';

const createProduct = async (req, res) => {
  try {
    const { sellerId, title, description, price, category, images, location } = req.body;
    const product = new Product({ sellerId, title, description, price, category, images, location });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProducts = async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search, status } = req.query;
    const query = { status: status || 'available' };

    if (category) query.category = category;
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) query.$text = { $search: search };

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateStatus = async (req, res) => {
  try {
    const { status } = req.body; // 'available', 'sold', 'deleted'
    const product = await Product.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const toggleWishlist = async (req, res) => {
  try {
    const { userId } = req.body;
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: 'Product not found' });

    if (product.wishlist.includes(userId)) {
      product.wishlist = product.wishlist.filter(id => id !== userId);
    } else {
      product.wishlist.push(userId);
    }
    await product.save();
    res.json({ wishlist: product.wishlist });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addReview = async (req, res) => {
  try {
    const { userId, rating, comment, images, isVerifiedPurchase } = req.body;
    const productId = req.params.id;

    const review = new Review({ productId, userId, rating, comment, images, isVerifiedPurchase });
    await review.save();

    // Update Product average rating
    const product = await Product.findById(productId);
    const newCount = product.reviewCount + 1;
    const newAvg = (product.avgRating * product.reviewCount + rating) / newCount;

    product.reviewCount = newCount;
    product.avgRating = newAvg;
    await product.save();

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.id }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const voteHelpful = async (req, res) => {
  try {
    const { userId } = req.body;
    const review = await Review.findById(req.params.reviewId);
    if (!review) return res.status(404).json({ error: 'Review not found' });

    if (review.helpfulVotes.includes(userId)) {
      review.helpfulVotes = review.helpfulVotes.filter(id => id !== userId);
    } else {
      review.helpfulVotes.push(userId);
    }
    await review.save();
    res.json({ helpfulVotes: review.helpfulVotes });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { createProduct, getProducts, getProductById, updateStatus, toggleWishlist, addReview, getReviews, voteHelpful };

