import Restaurant from '../models/Restaurant.js';
import Review from '../models/Review.js';

const addRestaurant = async (req, res) => {
  try {
    const { name, description, address, location, menu } = req.body;
    const restaurant = new Restaurant({ name, description, address, location, menu });
    await restaurant.save();
    res.status(201).json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRestaurants = async (req, res) => {
  try {
    const { lat, lon, maxDistance } = req.query;
    const query = {};

    if (lat && lon) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance) || 5000 // default 5km
        }
      };
    }

    const restaurants = await Restaurant.find(query);
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (!restaurant) return res.status(404).json({ error: 'Restaurant not found' });
    res.json(restaurant);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addReview = async (req, res) => {
  try {
    const { userId, restaurantId, rating, comment } = req.body;
    const review = new Review({ userId, restaurantId, rating, comment });
    await review.save();

    // Update restaurant average rating
    const reviews = await Review.find({ restaurantId });
    const avgRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length;
    await Restaurant.findByIdAndUpdate(restaurantId, { 
      rating: avgRating, 
      reviewCount: reviews.length 
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { addRestaurant, getRestaurants, getRestaurantById, addReview };
