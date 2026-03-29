import Ride from '../models/Ride.js';

const vehicleRates = {
  bike: 8,
  auto: 12,
  mini: 15,
  sedan: 22
};

const getFareEstimates = async (req, res) => {
  try {
    const { pickup, drop } = req.body;
    // Mock distance calculation
    const distance = Math.floor(Math.random() * 15) + 2; // 2-17 km
    
    const estimates = Object.keys(vehicleRates).map(type => ({
      type,
      fare: distance * vehicleRates[type],
      distance: `${distance} km`,
      duration: `${distance * 3} mins`
    }));

    res.json({ status: 'success', data: estimates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const bookRide = async (req, res) => {
  try {
    const { userId, pickup, drop, vehicleType, fare, distance, duration } = req.body;
    
    const ride = new Ride({
      userId,
      pickup,
      drop,
      vehicleType: vehicleType || 'mini',
      status: 'searching',
      fare,
      distance,
      duration
    });

    await ride.save();
    res.status(201).json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateRideStatus = async (req, res) => {
  try {
    const { rideId, driverId, status } = req.body;
    const update = { status };
    if (driverId) update.driverId = driverId;

    const ride = await Ride.findByIdAndUpdate(rideId, update, { new: true });
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRideHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const rides = await Ride.find({ userId }).sort({ createdAt: -1 });
    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getActiveRide = async (req, res) => {
  try {
    const { userId } = req.params;
    const ride = await Ride.findOne({ userId, status: { $in: ['searching', 'accepted', 'ongoing'] } }).sort({ createdAt: -1 });
    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Driver: get all pending rides (searching status)
const getPendingRides = async (req, res) => {
  try {
    const { vehicleType } = req.query;
    const query = { status: 'searching' };
    if (vehicleType) query.vehicleType = vehicleType;

    const rides = await Ride.find(query).sort({ createdAt: -1 }).limit(20);
    res.json(rides);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Driver: accept a ride
const acceptRide = async (req, res) => {
  try {
    const { driverId } = req.body;
    const ride = await Ride.findByIdAndUpdate(req.params.rideId, { status: 'accepted', driverId }, { new: true });
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Driver: reject a ride
const rejectRide = async (req, res) => {
  try {
    const ride = await Ride.findByIdAndUpdate(req.params.rideId, { status: 'searching' }, { new: true });
    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { getFareEstimates, bookRide, updateRideStatus, getRideHistory, getActiveRide, getPendingRides, acceptRide, rejectRide };
