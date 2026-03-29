import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';

const addHotel = async (req, res) => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();
    res.status(201).json({ status: 'success', data: hotel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
    res.json({ status: 'success', data: hotel });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addRooms = async (req, res) => {
  try {
    const { hotelId, rooms } = req.body;
    const createdRooms = await Room.insertMany(rooms.map(r => ({ ...r, hotelId })));
    // Update hotel price range
    const allRooms = await Room.find({ hotelId });
    const prices = allRooms.map(r => r.price);
    await Hotel.findByIdAndUpdate(hotelId, { priceRange: { min: Math.min(...prices), max: Math.max(...prices) } });
    res.status(201).json({ status: 'success', data: createdRooms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const searchHotels = async (req, res) => {
  try {
    const { lat, lon, maxDistance, minPrice, maxPrice, city, category, starRating, amenities, checkIn, checkOut, guests, sort = 'rating', page = 1, limit = 20 } = req.query;
    const filter = { isActive: true };

    if (lat && lon) {
      filter.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance) || 10000
        }
      };
    }
    if (city) filter.city = new RegExp(city, 'i');
    if (category) filter.category = category;
    if (starRating) filter.starRating = { $gte: parseInt(starRating) };
    if (minPrice) filter['priceRange.min'] = { $gte: parseInt(minPrice) };
    if (maxPrice) filter['priceRange.max'] = { ...(filter['priceRange.max'] || {}), $lte: parseInt(maxPrice) };
    if (amenities) filter.amenities = { $all: amenities.split(',') };

    const sortMap = { rating: { rating: -1 }, price_low: { 'priceRange.min': 1 }, price_high: { 'priceRange.max': -1 }, newest: { createdAt: -1 } };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [hotels, total] = await Promise.all([
      Hotel.find(filter).sort(sortMap[sort] || sortMap.rating).skip(skip).limit(parseInt(limit)),
      Hotel.countDocuments(filter)
    ]);

    res.json({ status: 'success', data: hotels, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getHotelDetails = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ error: 'Hotel not found' });
    const rooms = await Room.find({ hotelId: req.params.id });
    res.json({ status: 'success', data: { hotel, rooms } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getFeaturedHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ isFeatured: true, isActive: true }).sort({ rating: -1 }).limit(10);
    res.json({ status: 'success', data: hotels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getNearbyHotels = async (req, res) => {
  try {
    const { lat, lon, radius = 5000 } = req.query;
    if (!lat || !lon) return res.status(400).json({ error: 'lat and lon are required' });
    const hotels = await Hotel.find({
      isActive: true,
      location: { $near: { $geometry: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] }, $maxDistance: parseInt(radius) } }
    }).limit(20);
    res.json({ status: 'success', data: hotels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getOwnerHotels = async (req, res) => {
  try {
    const hotels = await Hotel.find({ ownerId: req.params.ownerId }).sort({ createdAt: -1 });
    res.json({ status: 'success', data: hotels });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { addHotel, updateHotel, addRooms, searchHotels, getHotelDetails, getFeaturedHotels, getNearbyHotels, getOwnerHotels };
