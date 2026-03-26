// Simulation of bridge functionality
const getUserContext = async (req, res) => {
  try {
    const { userId } = req.user; // From Gateway JWT
    const { appId } = req.params;
    
    // In real app, check if user granted permissions to this appId
    res.json({
      userId,
      appId,
      userPreferences: {}, // can be fetched from User service
      permissionsGranted: ['profile', 'location'] 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const notify = async (req, res) => {
  try {
    const { userId, title, message } = req.body;
    // Proxies to Notification Service internally
    res.json({ success: true, message: 'Notification scheduled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { getUserContext, notify };
