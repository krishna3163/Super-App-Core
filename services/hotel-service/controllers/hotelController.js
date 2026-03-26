import Hotel from '../models/Hotel.js';
import Room from '../models/Room.js';

const addHotel = async (req, res) => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();
    res.status(201).json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const addRooms = async (req, res) => {
  try {
    const { hotelId, rooms } = req.body;
    const createdRooms = await Room.insertMany(rooms.map(r => ({ ...r, hotelId })));
    res.status(201).json(createdRooms);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const searchHotels = async (req, res) => {
  try {
    const { lat, lon, maxDistance, minPrice, maxPrice } = req.query;
    const query = {};

    if (lat && lon) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance) || 10000 // default 10km
        }
      };
    }

    const hotels = await Hotel.find(query);
    // In real app, filter hotels based on room prices if min/max price provided
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getHotelDetails = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    const rooms = await Room.find({ hotelId: req.params.id });
    res.json({ hotel, rooms });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { addHotel, addRooms, searchHotels, getHotelDetails };
