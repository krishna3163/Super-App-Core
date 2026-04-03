import AdvancedRide from '../models/AdvancedRide.js';
import Driver from '../models/Driver.js';
import Earning from '../models/Earning.js';

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const FARE_RATES = {
  auto: { baseFare: 25, perKm: 9, perMin: 1.5, minFare: 30 },
  mini: { baseFare: 40, perKm: 12, perMin: 2, minFare: 50 },
  sedan: { baseFare: 60, perKm: 15, perMin: 2.5, minFare: 80 },
  suv: { baseFare: 80, perKm: 18, perMin: 3, minFare: 100 },
  bike: { baseFare: 15, perKm: 6, perMin: 1, minFare: 20 },
  pool: { baseFare: 30, perKm: 8, perMin: 1, minFare: 35 }
};

const calculateFare = async (pickup, drop, rideType = 'mini') => {
  const rates = FARE_RATES[rideType] || FARE_RATES.mini;
  let distance = 5; // default
  if (pickup?.location?.coordinates && drop?.location?.coordinates) {
    distance = calculateDistance(pickup.location.coordinates[1], pickup.location.coordinates[0], drop.location.coordinates[1], drop.location.coordinates[0]);
  }
  const time = distance * 2.5;
  
  const nearbyRequests = await AdvancedRide.countDocuments({
    status: 'requested', createdAt: { $gte: new Date(Date.now() - 15 * 60 * 1000) }
  });

  const availableDrivers = await Driver.countDocuments({ status: 'online' });
  let surgeMultiplier = 1.0;
  if (availableDrivers > 0) {
    if (nearbyRequests > availableDrivers * 4) surgeMultiplier = 2.0;
    else if (nearbyRequests > availableDrivers * 2) surgeMultiplier = 1.5;
    else if (nearbyRequests > availableDrivers) surgeMultiplier = 1.2;
  }

  const rawFare = rates.baseFare + (rates.perKm * distance) + (rates.perMin * time);
  const totalFare = Math.max(rawFare * surgeMultiplier, rates.minFare);

  return { fare: Math.round(totalFare), surgeMultiplier, distance: Math.round(distance * 10) / 10, time: Math.round(time), rideType };
};

const getFareEstimate = async (req, res) => {
  try {
    const { pickup, drop } = req.body;
    const estimates = {};
    for (const type of Object.keys(FARE_RATES)) {
      estimates[type] = await calculateFare(pickup, drop, type);
    }
    res.json({ status: 'success', data: estimates });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const requestRide = async (req, res) => {
  try {
    const { riderId, riderName, pickup, drop, rideType = 'mini', paymentMethod = 'cash', scheduledFor } = req.body;
    const { fare, surgeMultiplier, distance, time } = await calculateFare(pickup, drop, rideType);
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    
    const ride = new AdvancedRide({ 
      riderId, riderName, pickup, drop, fare, otp, surgeMultiplier, distance, 
      estimatedTime: time, rideType, paymentMethod, 
      scheduledFor: scheduledFor ? new Date(scheduledFor) : undefined,
      status: scheduledFor ? 'scheduled' : 'requested'
    });
    await ride.save();

    const drivers = await Driver.find({ status: 'online', vehicleType: { $in: [rideType, 'sedan', 'suv'] } }).limit(10);
    res.status(201).json({ status: 'success', data: { ride, nearbyDrivers: drivers.length, surgeMultiplier } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const acceptRide = async (req, res) => {
  try {
    const { rideId, driverId, driverName } = req.body;
    const ride = await AdvancedRide.findById(rideId);
    if (!ride || ride.status !== 'requested') return res.status(400).json({ error: 'Ride not available' });

    ride.driverId = driverId;
    ride.driverName = driverName;
    ride.status = 'accepted';
    ride.acceptedAt = new Date();
    await ride.save();
    await Driver.findOneAndUpdate({ userId: driverId }, { status: 'on_ride' });
    res.json({ status: 'success', data: ride });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const startRide = async (req, res) => {
  try {
    const ride = await AdvancedRide.findByIdAndUpdate(
      req.params.rideId,
      { status: 'in_progress', startedAt: new Date() },
      { new: true }
    );
    res.json({ status: 'success', data: ride });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const completeRide = async (req, res) => {
  try {
    const ride = await AdvancedRide.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });

    ride.status = 'completed';
    ride.paymentStatus = 'paid';
    ride.completedAt = new Date();
    await ride.save();

    const driverCut = ride.fare * 0.8;
    const earning = new Earning({ driverId: ride.driverId, rideId: ride._id, amount: driverCut, date: new Date().toISOString().split('T')[0] });
    await earning.save();
    await Driver.findOneAndUpdate({ userId: ride.driverId }, { status: 'online', $inc: { totalRides: 1, totalEarnings: driverCut } });

    res.json({ status: 'success', data: { ride, driverEarning: driverCut } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const cancelRide = async (req, res) => {
  try {
    const { reason, cancelledBy } = req.body;
    const ride = await AdvancedRide.findByIdAndUpdate(req.params.rideId, {
      status: 'cancelled', cancellationReason: reason, cancelledBy, cancelledAt: new Date()
    }, { new: true });
    if (ride.driverId) await Driver.findOneAndUpdate({ userId: ride.driverId }, { status: 'online' });
    res.json({ status: 'success', data: ride });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const rateRide = async (req, res) => {
  try {
    const { rating, review, ratedBy } = req.body;
    const ride = await AdvancedRide.findByIdAndUpdate(req.params.rideId, {
      'rating.score': rating, 'rating.review': review, 'rating.ratedBy': ratedBy
    }, { new: true });

    if (ride.driverId) {
      const driverRides = await AdvancedRide.find({ driverId: ride.driverId, 'rating.score': { $exists: true } });
      const avgRating = driverRides.reduce((sum, r) => sum + r.rating.score, 0) / driverRides.length;
      await Driver.findOneAndUpdate({ userId: ride.driverId }, { rating: Math.round(avgRating * 10) / 10 });
    }
    res.json({ status: 'success', data: ride });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getRideHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const rides = await AdvancedRide.find({ riderId: req.params.userId }).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
    res.json({ status: 'success', data: rides });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const trackRide = async (req, res) => {
  try {
    const ride = await AdvancedRide.findById(req.params.rideId);
    if (!ride) return res.status(404).json({ error: 'Ride not found' });
    const driver = ride.driverId ? await Driver.findOne({ userId: ride.driverId }) : null;
    res.json({ status: 'success', data: { ride, driver } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const sosEmergency = async (req, res) => {
  try {
    const { rideId, userId, location } = req.body;
    const ride = await AdvancedRide.findByIdAndUpdate(rideId, { $push: { sosAlerts: { userId, location, triggeredAt: new Date() } } }, { new: true });
    // In real app: notify emergency contacts, admin, and nearby authorities
    res.json({ status: 'success', message: 'SOS alert sent', data: { rideId, alertedAt: new Date() } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { getFareEstimate, requestRide, acceptRide, startRide, completeRide, cancelRide, rateRide, getRideHistory, trackRide, sosEmergency };
