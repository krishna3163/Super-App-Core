import AdminConfig from '../models/AdminConfig.js';

const getConfig = async (req, res) => {
  try {
    let config = await AdminConfig.findOne();
    if (!config) {
      config = new AdminConfig();
      await config.save();
    }
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateConfig = async (req, res) => {
  try {
    const config = await AdminConfig.findOneAndUpdate({}, req.body, { new: true, upsert: true });
    res.json(config);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { getConfig, updateConfig };
