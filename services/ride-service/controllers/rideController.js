import Ride from '../models/Ride.js';

const bookRide = async (req, res) => {
  try {
    const { userId, pickup, drop } = req.body;
    
    // Simple fare estimation logic (could use distance matrix API in real app)
    const estimatedDistance = Math.floor(Math.random() * 20) + 1; // 1-20 km
    const estimatedFare = estimatedDistance * 15; // 15 units per km

    const ride = new Ride({
      userId,
      pickup,
      drop,
      status: 'searching',
      fare: estimatedFare,
      distance: `${estimatedDistance} km`,
      duration: `${estimatedDistance * 3} mins`
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
    const rides = await Ride.find({ status: 'searching' }).sort({ createdAt: -1 }).limit(20);
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

export default { bookRide, updateRideStatus, getRideHistory, getActiveRide, getPendingRides, acceptRide, rejectRide };
