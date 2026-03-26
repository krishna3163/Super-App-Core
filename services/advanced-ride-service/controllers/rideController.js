import AdvancedRide from '../models/AdvancedRide.js';
import Driver from '../models/Driver.js';
import Earning from '../models/Earning.js';

const calculateFare = async (pickup, drop) => {
  // Simple distance calculation (mocked for now, in real app use Google Maps API)
  const distance = Math.random() * 10; // in km
  const time = distance * 2; // in minutes (avg speed 30km/h)
  
  const baseFare = 5;
  const distanceFare = 1.5 * distance;
  const timeFare = 0.5 * time;
  
  // Surge Logic: Check count of active requests in the area
  const nearbyRequests = await AdvancedRide.countDocuments({
    status: 'requested',
    createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }, // last 15 mins
    'pickup.location': {
      $near: {
        $geometry: pickup.location,
        $maxDistance: 5000
      }
    }
  });

  // Check online drivers in the area
  const availableDrivers = await Driver.countDocuments({
    status: 'online',
    location: {
      $near: {
        $geometry: pickup.location,
        $maxDistance: 5000
      }
    }
  });

  let surgeMultiplier = 1.0;
  if (nearbyRequests > availableDrivers * 2 && availableDrivers > 0) {
    surgeMultiplier = 1.5;
  } else if (nearbyRequests > availableDrivers * 4 && availableDrivers > 0) {
    surgeMultiplier = 2.0;
  }

  const totalFare = (baseFare + distanceFare + timeFare) * surgeMultiplier;
  return { fare: Math.round(totalFare * 100) / 100, surgeMultiplier, distance, time };
};

const requestRide = async (req, res) => {
  try {
    const { riderId, pickup, drop } = req.body;
    
    const { fare, surgeMultiplier, distance, time } = await calculateFare(pickup, drop);
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    const ride = new AdvancedRide({ riderId, pickup, drop, fare, otp, surgeMultiplier, distance, estimatedTime: time });
    await ride.save();

    // Matching Logic: Find nearest online drivers within 5km
    const drivers = await Driver.find({
      status: 'online',
      location: {
        $near: {
          $geometry: pickup.location,
          $maxDistance: 5000
        }
      }
    }).limit(5);

    res.status(201).json({ ride, nearbyDrivers: drivers, surgeMultiplier });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const acceptRide = async (req, res) => {
  try {
    const { rideId, driverId } = req.body;
    const ride = await AdvancedRide.findById(rideId);
    if (ride.status !== 'requested') return res.status(400).json({ error: 'Ride no longer available' });

    ride.driverId = driverId;
    ride.status = 'accepted';
    await ride.save();

    await Driver.findOneAndUpdate({ userId: driverId }, { status: 'on_ride' });
    res.json(ride);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const completeRide = async (req, res) => {
  try {
    const { rideId } = req.params;
    const ride = await AdvancedRide.findById(rideId);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    ride.status = 'completed';
    ride.paymentStatus = 'paid';
    await ride.save();

    // Calculate Earnings (80% to driver)
    const earningAmount = ride.fare * 0.8;
    const earning = new Earning({ driverId: ride.driverId, rideId: ride._id, amount: earningAmount });
    await earning.save();

    await Driver.findOneAndUpdate({ userId: ride.driverId }, { status: 'online', $inc: { totalRides: 1 } });
    res.json({ ride, earning });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { requestRide, acceptRide, completeRide };
