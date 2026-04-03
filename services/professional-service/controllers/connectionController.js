import Connection from '../models/Connection.js';

const sendRequest = async (req, res) => {
  try {
    const { requesterId, recipientId } = req.body;
    const existing = await Connection.findOne({ requesterId, recipientId });
    if (existing) return res.status(400).json({ error: 'Request already sent' });

    const connection = new Connection({ requesterId, recipientId });
    await connection.save();
    res.status(201).json(connection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const respondToRequest = async (req, res) => {
  try {
    const { connectionId, status } = req.body; // 'accepted' or 'rejected'
    const connection = await Connection.findByIdAndUpdate(connectionId, { status }, { new: true });
    res.json(connection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getConnections = async (req, res) => {
  try {
    const { userId } = req.params;
    const connections = await Connection.find({
      $or: [{ requesterId: userId }, { recipientId: userId }],
      status: 'accepted'
    });
    res.json(connections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export default { sendRequest, respondToRequest, getConnections };
