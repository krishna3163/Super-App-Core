import Driver from '../models/Driver.js';
import Earning from '../models/Earning.js';

const registerDriver = async (req, res) => {
  try {
    const driver = new Driver(req.body);
    await driver.save();
    res.status(201).json(driver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateLocation = async (req, res) => {
  try {
    const { driverId, location, status } = req.body;
    const driver = await Driver.findOneAndUpdate(
      { userId: driverId },
      { location, status },
      { new: true }
    );
    res.json(driver);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEarnings = async (req, res) => {
  try {
    const { driverId } = req.params;
    const earnings = await Earning.find({ driverId }).sort({ createdAt: -1 });
    const total = earnings.reduce((acc, curr) => acc + curr.amount, 0);
    res.json({ total, history: earnings });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { registerDriver, updateLocation, getEarnings };
