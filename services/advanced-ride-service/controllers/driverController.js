import Driver from '../models/Driver.js';
import Earning from '../models/Earning.js';

const registerDriver = async (req, res) => {
  try {
    const driver = await Driver.findOneAndUpdate({ userId: req.body.userId }, req.body, { upsert: true, new: true });
    res.json({ status: 'success', data: driver });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDriverProfile = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.params.userId });
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    res.json({ status: 'success', data: driver });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { userId, lat, lon } = req.body;
    await Driver.findOneAndUpdate({ userId }, { location: { type: 'Point', coordinates: [lon, lat] } });
    res.json({ status: 'success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const toggleOnline = async (req, res) => {
  try {
    const { userId, status } = req.body;
    const driver = await Driver.findOneAndUpdate({ userId }, { status }, { new: true });
    res.json({ status: 'success', data: driver });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEarnings = async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = 'today' } = req.query;
    const driver = await Driver.findOne({ userId });
    
    let dateFilter = {};
    const now = new Date();
    if (period === 'today') dateFilter = { date: now.toISOString().split('T')[0] };
    else if (period === 'week') {
      const weekAgo = new Date(now.setDate(now.getDate() - 7));
      dateFilter = { createdAt: { $gte: weekAgo } };
    } else if (period === 'month') {
      const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
      dateFilter = { createdAt: { $gte: monthAgo } };
    }

    const earnings = await Earning.find({ driverId: userId, ...dateFilter }).sort({ createdAt: -1 });
    const totalAmount = earnings.reduce((sum, e) => sum + e.amount, 0);

    res.json({ status: 'success', data: {
      period, totalAmount, ridesCount: earnings.length,
      avgPerRide: earnings.length > 0 ? Math.round(totalAmount / earnings.length) : 0,
      earnings: earnings.slice(0, 50),
      overallStats: { totalRides: driver?.totalRides || 0, totalEarnings: driver?.totalEarnings || 0, rating: driver?.rating || 0 }
    }});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getNearbyDrivers = async (req, res) => {
  try {
    const { lat, lon, radius = 5000, vehicleType } = req.query;
    const filter = { status: 'online' };
    if (vehicleType) filter.vehicleType = vehicleType;
    if (lat && lon) {
      filter.location = { $near: { $geometry: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] }, $maxDistance: parseInt(radius) } };
    }
    const drivers = await Driver.find(filter).limit(20);
    res.json({ status: 'success', data: drivers });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { registerDriver, getDriverProfile, updateLocation, toggleOnline, getEarnings, getNearbyDrivers };
