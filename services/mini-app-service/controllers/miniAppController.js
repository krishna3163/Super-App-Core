import MiniApp from '../models/MiniApp.js';

const registerApp = async (req, res) => {
  try {
    const { appId, name, description, icon, developerId, entryUrl, category, permissions } = req.body;
    const miniApp = new MiniApp({ appId, name, description, icon, developerId, entryUrl, category, permissions });
    await miniApp.save();
    res.status(201).json(miniApp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getApps = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { status: 'active' };
    if (category) query.category = category;
    
    const apps = await MiniApp.find(query).sort({ name: 1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAppById = async (req, res) => {
  try {
    const miniApp = await MiniApp.findOne({ appId: req.params.appId });
    if (!miniApp) return res.status(404).json({ error: 'Mini app not found' });
    res.json(miniApp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateAppStatus = async (req, res) => {
  try {
    const { appId } = req.params;
    const { status } = req.body; // 'active', 'inactive', 'under_review'
    const miniApp = await MiniApp.findOneAndUpdate({ appId }, { status }, { new: true });
    res.json(miniApp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { registerApp, getApps, getAppById, updateAppStatus };
