import ServiceProvider from '../models/ServiceProvider.js';

export const createProviderProfile = async (req, res) => {
  try {
    const provider = new ServiceProvider(req.body);
    await provider.save();
    res.status(201).json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const searchProviders = async (req, res) => {
  try {
    const { q, category, lat, lon, maxDistance } = req.query;
    const query = {};

    if (category) query.category = category;
    if (q) query.$text = { $search: q };
    if (lat && lon) {
      query.location = {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lon), parseFloat(lat)] },
          $maxDistance: parseInt(maxDistance) || 20000 // default 20km
        }
      };
    }

    const providers = await ServiceProvider.find(query).sort({ rating: -1 });
    res.json(providers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getProviderById = async (req, res) => {
  try {
    const provider = await ServiceProvider.findById(req.params.id);
    if (!provider) return res.status(404).json({ error: 'Provider not found' });
    res.json(provider);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
