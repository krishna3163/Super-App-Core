import AdvancedMiniApp from '../models/AdvancedMiniApp.js';
import UserMiniApp from '../models/UserMiniApp.js';

const registerApp = async (req, res) => {
  try {
    const miniApp = new AdvancedMiniApp(req.body);
    await miniApp.save();
    res.status(201).json(miniApp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllApps = async (req, res) => {
  try {
    const { category } = req.query;
    const query = { status: 'active' };
    if (category) query.category = category;
    
    const apps = await AdvancedMiniApp.find(query).sort({ installCount: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const pinApp = async (req, res) => {
  try {
    const { userId, appId, isPinned } = req.body;
    const userApp = await UserMiniApp.findOneAndUpdate(
      { userId, appId },
      { isPinned, lastOpened: Date.now() },
      { new: true, upsert: true }
    );
    res.json(userApp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPinnedApps = async (req, res) => {
  try {
    const { userId } = req.params;
    const pinned = await UserMiniApp.find({ userId, isPinned: true });
    const appIds = pinned.map(p => p.appId);
    const apps = await AdvancedMiniApp.find({ appId: { $in: appIds } });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const launchApp = async (req, res) => {
  try {
    const { userId, appId } = req.body;
    await UserMiniApp.findOneAndUpdate(
      { userId, appId },
      { lastOpened: Date.now() },
      { upsert: true }
    );
    await AdvancedMiniApp.findOneAndUpdate({ appId }, { $inc: { installCount: 1 } });
    const app = await AdvancedMiniApp.findOne({ appId });
    res.json(app);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { registerApp, getAllApps, pinApp, getPinnedApps, launchApp };
